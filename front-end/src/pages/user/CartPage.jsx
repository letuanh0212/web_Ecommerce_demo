import React, { useEffect, useState } from "react";
import { Table, Button, InputNumber, Typography, Card, Row, Col, Empty, Popconfirm, message, Tag, Modal, Radio, Select, Input } from "antd";
import { DeleteOutlined, ShoppingCartOutlined, ArrowRightOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "../../unti/axios.cusomize.js"; 
import {createVnPayApi} from "../../unti/vnpay.js"
import { getCart, updateCartQuantity, removeFromCart, clearCart } from "../../unti/cart"; 

const { Title, Text } = Typography;

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("vnpay"); 
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [note, setNote] = useState("");

  const [userVouchers, setUserVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    const items = getCart();
    setCartItems(items);
    calculateTotal(items);

    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setShippingName(user.name || "");
      setShippingPhone(user.phone || "");
      if (user.addresses?.length > 0) {
        setSelectedAddress(user.addresses[0].fullAddress);
      }

      // Fetch user's saved vouchers
      fetchUserVouchers();
    }
  }, []);

  const calculateTotal = (items) => {
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotalPrice(total);
  };

  const fetchUserVouchers = async () => {
    try {
      const res = await axios.get("/api/user-vouchers");
      if (res && res.vouchers) {
        setUserVouchers(res.vouchers);
      }
    } catch (err) {
      console.warn("Could not fetch user vouchers:", err);
    }
  };

  const handleApplyVoucher = (voucherId) => {
    const voucher = userVouchers.find(v => v.id === voucherId);
    if (!voucher) {
      message.error("Voucher không hợp lệ");
      return;
    }

    // Check if order meets minimum value
    if (totalPrice < voucher.min_order_value) {
      message.warning(`Đơn hàng phải tối thiểu ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(voucher.min_order_value)}`);
      return;
    }

    // Check if user has exceeded max uses
    if (voucher.used_count >= voucher.max_uses) {
      message.error("Bạn đã sử dụng hết lượt dùng voucher này");
      return;
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discount_type === "percent") {
      discount = totalPrice * (voucher.discount_value / 100);
    } else {
      discount = voucher.discount_value;
    }

    // Discount cannot exceed order total
    if (discount > totalPrice) {
      discount = totalPrice;
    }

    setSelectedVoucher(voucher);
    setDiscountAmount(discount);
    message.success(`Áp dụng voucher ${voucher.code} thành công`);
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setDiscountAmount(0);
    message.info("Đã hủy voucher");
  };

  const handleQuantityChange = (value, record) => {
    if (!value) return;
    if (value > record.stock) {
      message.warning(`Kho chỉ còn ${record.stock} sản phẩm!`);
      return;
    }
    const newCart = updateCartQuantity(record.id, record.variant_id, value);
    setCartItems(newCart);
    calculateTotal(newCart);
  };

  const handleRemove = (record) => {
    const newCart = removeFromCart(record.id, record.variant_id);
    setCartItems(newCart);
    calculateTotal(newCart);
    message.success("Đã xóa sản phẩm");
  };

  const handleCheckout = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      message.warning("Bạn cần đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      message.error("Giỏ hàng trống!");
      return;
    }

    setCheckoutModalVisible(true);
  };



const confirmCheckout = async () => {
  if (!selectedAddress) {
    message.warning("Vui lòng chọn địa chỉ giao hàng!");
    return;
  }
  if (!shippingName || !shippingPhone) {
    message.warning("Vui lòng nhập họ tên và số điện thoại!");
    return;
  }

    try {
      setLoading(true);

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const orderItems = cartItems.map(item => ({
        item_id: item.id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        price: item.price
      }));

      const payload = {
        items: orderItems,
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: selectedAddress,
        note,
        email: currentUser?.email || null,
        voucher_id: selectedVoucher?.id || null,
        discount_amount: discountAmount
      };

      console.log('[CartPage] confirmCheckout payload', payload, 'paymentMethod:', paymentMethod);

      if (paymentMethod === "cod") {
        const resp = await axios.post("/api/orders/order/cod", payload);

        console.log('[CartPage] COD response', resp);

        // axios instance returns response.data directly via interceptor
        if (resp && resp.success) {
          message.success("Đặt hàng thành công!");

          clearCart();
          setCartItems([]);
          setTotalPrice(0);

          setCheckoutModalVisible(false);

          navigate("/"); // đi đến lịch sử đơn hàng
        } else {
          message.error(resp?.message || "Đặt hàng thất bại.");
        }

      } else if (paymentMethod === "vnpay") {
        // create VNPAY order and redirect to paymentUrl
        const resp = await createVnPayApi(payload);
        console.log('[CartPage] VNPAY create response', resp);
        if (resp && resp.success && resp.paymentUrl) {
          // redirect to payment gateway
          window.location.href = resp.paymentUrl;
        } else {
          message.error(resp?.message || "Tạo đơn VNPAY thất bại.");
        }
      }

    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Lỗi tạo đơn.");
    } finally {
      setLoading(false);
    }
};



  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      width: 400,
      render: (text, record) => (
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          <img
            alt={text}
            src={record.image || "https://placehold.co/100x100?text=No+Img"}
            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
          />
          <div>
            <Text strong style={{ fontSize: 16 }}>{text}</Text>
            {record.variant_id && (
              <div style={{ marginTop: 4 }}>
                <Tag color="geekblue">{record.size}</Tag>
                <Tag color="magenta">{record.color}</Tag>
              </div>
            )}
            <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Shop: {record.store_name}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      render: (price) => <Text>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}</Text>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (qty, record) => (
        <InputNumber min={1} max={record.stock} value={qty} onChange={(val) => handleQuantityChange(val, record)} />
      ),
    },
    {
      title: "Thành tiền",
      render: (_, record) => (
        <Text type="danger" strong>
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.price * record.quantity)}
        </Text>
      ),
    },
    {
      title: "",
      render: (_, record) => (
        <Popconfirm title="Xóa khỏi giỏ?" onConfirm={() => handleRemove(record)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Empty description="Giỏ hàng trống trơn" />
        <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate("/")} style={{ marginTop: 20 }}>
          Về trang chủ mua sắm
        </Button>
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: "30px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Title level={2}><ShoppingCartOutlined /> Giỏ hàng ({cartItems.length})</Title>
          {currentUser && <Text type="secondary"><UserOutlined /> Xin chào, {currentUser.name}</Text>}
        </div>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 8 }}>
              <Table
                dataSource={cartItems}
                columns={columns}
                rowKey={(r) => `${r.id}-${r.variant_id ?? 'none'}`}
                pagination={false}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 8, position: 'sticky', top: 20 }}>
              {/* Voucher section */}
              {userVouchers && userVouchers.length > 0 && (
                <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #eee" }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>Chọn voucher:</Text>
                  <Select
                    placeholder="Chọn voucher để áp dụng"
                    style={{ width: "100%", marginBottom: 8 }}
                    value={selectedVoucher?.id || undefined}
                    onChange={handleApplyVoucher}
                    options={userVouchers.map(v => ({
                      value: v.id,
                      label: (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span><strong>{v.code}</strong> - {v.discount_type === 'percent' ? `${v.discount_value}%` : `${new Intl.NumberFormat('vi-VN').format(v.discount_value)} VND`}</span>
                          <span style={{ color: '#999', fontSize: 12 }}>Min: {new Intl.NumberFormat('vi-VN').format(v.min_order_value)} VND</span>
                        </div>
                      )
                    }))}
                  />
                  {selectedVoucher && (
                    <div style={{ background: "#f0f5ff", padding: 8, borderRadius: 4, marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <Text>Voucher: <strong>{selectedVoucher.code}</strong></Text>
                        <Button type="text" danger size="small" onClick={handleRemoveVoucher}>Hủy</Button>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 4 }}>
                        <Text>Giảm giá:</Text>
                        <Text type="success" strong>-{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discountAmount)}</Text>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ fontSize: 16 }}>Tạm tính:</Text>
                <Text style={{ fontSize: 16 }}>
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
                </Text>
              </div>

              {selectedVoucher && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, color: "#52c41a" }}>
                  <Text style={{ fontSize: 14 }}>Giảm giá:</Text>
                  <Text style={{ fontSize: 14, color: "#52c41a" }}>
                    -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discountAmount)}
                  </Text>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, paddingTop: 12, borderTop: "2px solid #eee" }}>
                <Text strong style={{ fontSize: 18 }}>Tổng cộng:</Text>
                <Text type="danger" strong style={{ fontSize: 24 }}>
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice - discountAmount)}
                </Text>
              </div>
              <Button type="primary" size="large" block icon={<ArrowRightOutlined />} loading={loading} onClick={handleCheckout}>
                THANH TOÁN
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal chọn địa chỉ + thông tin giao hàng + phương thức thanh toán */}
      <Modal
        title="Thanh toán"
        open={checkoutModalVisible}
        onOk={confirmCheckout}
        onCancel={() => setCheckoutModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Họ tên người nhận:</Text>
          <Input
            style={{ width: "100%", marginTop: 8 }}
            value={shippingName}
            onChange={(e) => setShippingName(e.target.value)}
            placeholder="Nhập họ tên"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Số điện thoại:</Text>
          <Input
            style={{ width: "100%", marginTop: 8 }}
            value={shippingPhone}
            onChange={(e) => setShippingPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Địa chỉ giao hàng:</Text>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Chọn hoặc nhập địa chỉ"
            value={selectedAddress}
            showSearch
            onChange={(val) => setSelectedAddress(val)}
            onSearch={(val) => setSelectedAddress(val)}
            filterOption={false}
            options={[
              ...(currentUser?.addresses?.map(addr => ({ value: addr.fullAddress, label: addr.fullAddress })) || []),
              ...(selectedAddress && !currentUser?.addresses?.find(a => a.fullAddress === selectedAddress)
                ? [{ value: selectedAddress, label: selectedAddress }]
                : [])
            ]}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Ghi chú:</Text>
          <Input.TextArea
            style={{ width: "100%", marginTop: 8 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú (nếu có)"
          />
        </div>

        <div>
          <Text strong>Chọn phương thức thanh toán:</Text>
          <Radio.Group
            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <Radio value="vnpay">VNPAY</Radio>
            <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
          </Radio.Group>
        </div>
      </Modal>
    </div>
  );
};

export default CartPage;
