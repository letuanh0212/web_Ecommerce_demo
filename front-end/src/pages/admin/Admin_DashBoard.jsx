import React, { useEffect, useState } from "react";
import { Card, Button, Typography, Table, Tag, Row, Col, notification, Spin } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  DollarCircleOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { useNavigate } from 'react-router-dom';
import api from "../../unti/axios.cusomize";
import adminApi from "../../unti/api_admin";


const { Title, Text } = Typography;

const getStatusInfo = (status) => {
  switch (status) {
    case 'Pending': return { color: 'orange', icon: <ClockCircleOutlined /> };
    case 'Processing': return { color: 'blue', icon: <DollarCircleOutlined /> };
    case 'Shipped': return { color: 'cyan', icon: <TruckOutlined /> };
    case 'Completed': return { color: 'green', icon: <CheckCircleOutlined /> };
    default: return { color: 'default', icon: null };
  }
};

const orderColumns = [
  { title: "Mã Đơn", dataIndex: "orderId" },
  { title: "Khách hàng", dataIndex: "customer" },
  {
    title: "Tổng tiền",
    dataIndex: "total",
    render: (text) => `${Number(text).toLocaleString('vi-VN')}₫`
  },
  { title: "Ngày đặt", dataIndex: "date" },
  {
    title: "Trạng thái",
    dataIndex: "status",
    render: (status) => {
      const info = getStatusInfo(status);
      return (
        <Tag color={info.color} icon={info.icon}>
          {String(status || '').toUpperCase()}
        </Tag>
      );
    }
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    users: 0,
    stores: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    vouchers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]); // for line chart
  const [topItems, setTopItems] = useState([]); // for bar chart

  useEffect(() => {
    let mounted = true;

    const handle401 = (err) => {
      if (err && err.response && err.response.status === 401) {
        notification.error({ message: "Phiên đăng nhập hết hạn", description: "Vui lòng đăng nhập lại" });
        navigate('/login');
        return true;
      }
      return false;
    };

    const fetchAll = async () => {
      setLoading(true);

      try {
        // 1) Users = user + seller (LÀM Ở FRONTEND)
        let usersCount = 0;
        let storesCount = 0;
        let productsCount = 0;
        let ordersCount = 0;
        let ordersList = [];

        try {
          const [users, sellers] = await Promise.all([
            adminApi.getUsers(),     // role = user
            adminApi.getSellers(),   // role = seller
          ]);

          const userLength = Array.isArray(users) ? users.length : 0;
          const sellerLength = Array.isArray(sellers) ? sellers.length : 0;

          usersCount = userLength + sellerLength; // 👈 USER + SELLER

          console.log("Users:", userLength, "Sellers:", sellerLength);
        } catch (err) {
          if (handle401(err)) return;
          console.error("Fetch users/sellers error:", err);
        }

        // ================= STORES =================
          try {
            const stores = await adminApi.getStores();
            storesCount = Array.isArray(stores) ? stores.length : 0;
            console.log("Stores:", storesCount);
          } catch (err) {
            if (handle401(err)) return;
            console.error("Fetch stores error:", err);
          }

        // products: still fetch items endpoint
        try {
          const items = await api.get('/api/items');
          if (Array.isArray(items)) productsCount = items.length;
        } catch (err) {
          if (handle401(err)) return;
        }

        // orders list: get via admin endpoint (needed for charts / recent orders)
        try {
          const orders = await adminApi.getOrders(1000);
          if (Array.isArray(orders)) {
            ordersList = orders;
            ordersCount = orders.length;
          }
        } catch (err) {
          if (handle401(err)) return;
          console.log('Orders fetch error (admin):', err.message || err);
          ordersList = [];
          ordersCount = 0;
        }

        // 5) Vouchers - skip for now
        let vouchersCount = 0;

        // 6) Revenue & charts - best effort:
        let totalRevenue = 0;
        
        // Lọc chỉ lấy orders với status = "Completed"
        const completedOrders = Array.isArray(ordersList) 
          ? ordersList.filter(o => o.status === 'Completed' || o.status === 'completed')
          : [];
        
        if (completedOrders.length > 0) {
          // Cộng tổng tiền từ các completed orders
          totalRevenue = completedOrders.reduce((acc, o) => {
            const amount = Number(o.totalAmount || o.total || o.total_amount || o.price || 0) || 0;
            return acc + amount;
          }, 0);
          console.log(`Total Revenue from ${completedOrders.length} completed orders:`, totalRevenue);
          
          // Sử dụng completedOrders cho charts thay vì tất cả orders
          const now = new Date();
          const months = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getMonth() + 1}/${d.getFullYear()}`; // MM/YYYY
            months.push({ key, value: 0 });
          }
          const monthIndexMap = Object.fromEntries(months.map((m, idx) => [m.key, idx]));

          completedOrders.forEach(o => {
            const ts = o.createdAt || o.date || o.created_at || o.order_date;
            const total = Number(o.totalAmount || o.total || o.total_amount || o.price || 0) || 0;
            if (!ts) return;
            const d = new Date(ts);
            if (isNaN(d)) return;
            const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
            const idx = monthIndexMap[key];
            if (typeof idx === 'number') {
              months[idx].value += total;
            }
          });

          const revenueChart = months.map(m => {
            return { month: m.key, value: Math.round((m.value / 1000000) * 10) / 10 };
          });
          setRevenueData(revenueChart);

          // top items: từ completed orders
          const itemCounts = {};
          completedOrders.forEach(o => {
            const items = o.items || o.order_items || o.lines || o.orderDetails;
            if (Array.isArray(items)) {
              items.forEach(it => {
                const name = it.name || it.title || (it.item && it.item.name) || 'Unknown';
                const qty = Number(it.quantity || it.qty || it.count) || 1;
                itemCounts[name] = (itemCounts[name] || 0) + qty;
              });
            }
          });
          const top = Object.entries(itemCounts)
            .map(([name, sold]) => ({ name, sold }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 6);
          if (top.length > 0) setTopItems(top);
        } else {
          // Fallback nếu không có completed orders
          console.warn("No completed orders found");
          setRevenueData([
            { month: "T1", value: 0 },
            { month: "T2", value: 0 },
            { month: "T3", value: 0 },
            { month: "T4", value: 0 },
            { month: "T5", value: 0 },
            { month: "T6", value: 0 },
          ]);
          setTopItems([]);
        }

        // recent orders (lấy 5 completed orders gần nhất)
        const recent = (completedOrders.length > 0 ? completedOrders.slice().sort((a, b) => {
          const da = new Date(a.createdAt || a.date || a.created_at || a.order_date || 0).getTime();
          const db = new Date(b.createdAt || b.date || b.created_at || b.order_date || 0).getTime();
          return db - da;
        }).slice(0, 5) : []).map((o, idx) => ({
          key: o.id || o._id || idx,
          orderId: o.code || (o.id ? `#${o.id}` : `#${idx + 1}`),
          customer: (o.users && (o.users.name )) || 'Khách Hàng',
          total: Number(o.totalAmount || o.total || o.total_amount || 0) || 0,
          status: o.status || o.state || 'Unknown',
          date: new Date(o.createdAt || o.date || o.created_at || o.order_date || Date.now()).toLocaleDateString(),
        }));

        if (mounted) {
          setCounts({
            users: usersCount,
            stores: storesCount,
            products: productsCount,
            orders: ordersCount,
            revenue: totalRevenue,
            vouchers: vouchersCount,
          });
          setRecentOrders(recent);
        }

      } catch (err) {
        if (!handle401(err)) {
          notification.error({ message: "Lỗi tải dữ liệu dashboard", description: err.message || String(err) });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();

    return () => { mounted = false; };
  }, [navigate]);

  // UI arrays for summary cards (values from counts)
  const summaryCards = [
    { title: "Users", value: counts.users, color: "green", icon: <UserOutlined /> },
    { title: "Stores", value: counts.stores, color: "blue", icon: <ShopOutlined /> },
    { title: "Products", value: counts.products, color: "purple", icon: <GiftOutlined /> },
    { title: "Orders", value: counts.orders, color: "orange", icon: <ShoppingCartOutlined /> },
    { title: "Revenue", value: counts.revenue ? `${Number(counts.revenue).toLocaleString('vi-VN')}₫` : "0₫", color: "green", icon: <DollarCircleOutlined /> },
    { title: "Active Vouchers", value: counts.vouchers, color: "red", icon: <GiftOutlined /> },
  ];

  return (
    <>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={20}>
            {summaryCards.map((item, i) => (
              <Col key={i} xs={24} sm={12} md={8} lg={6}>
                <Card style={{ borderRadius: 10 }}>
                  <Row align="middle" gutter={10}>
                    <Col>{item.icon}</Col>
                    <Col flex="auto">
                      <Text type="secondary">{item.title}</Text>
                      <Title level={3} style={{ margin: 0 }}>{item.value}</Title>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={20} style={{ marginTop: 20 }}>
            <Col xs={24} lg={14}>
              <Card title="Doanh Thu 6 Tháng Gần Nhất" style={{ borderRadius: 10 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${v}M`} />
                    <Tooltip formatter={(v) => [`${v} triệu`, "Doanh thu"]} />
                    <Line type="monotone" dataKey="value" stroke="#1890ff" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card title="Top Sản Phẩm Bán Chạy" style={{ borderRadius: 10 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={topItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sold" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Card
            title="Đơn hàng mới nhất"
            extra={<Button type="link" onClick={() => navigate("/admin/orders")}>Xem tất cả</Button>}
            style={{ marginTop: 20, borderRadius: 10 }}
          >
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              pagination={false}
            />
          </Card>

          <Row gutter={20} style={{ marginTop: 20 }}>
            {[
              { label: "Orders Pending", value: "-" },
              { label: "Sản phẩm hết hàng", value: "-" },
              { label: "Voucher sắp hết hạn", value: "-" },
              { label: "Cửa hàng mới tuần này", value: "-" },
            ].map((item, idx) => (
              <Col key={idx} xs={12} sm={6}>
                <Card style={{ textAlign: "center", borderRadius: 10 }}>
                  <Title level={3}>{item.value}</Title>
                  <Text type="secondary">{item.label}</Text>
                </Card>
              </Col>
            ))}
          </Row>

          <Title level={4} style={{ marginTop: 20 }}>Truy cập nhanh</Title>
          <Row gutter={20}>
            {[
              { label: "Quản lý Đơn hàng", path: "/admin/orders", icon: <ShoppingCartOutlined /> },
              { label: "Quản lý Người dùng", path: "/admin/users", icon: <UserOutlined /> },
              { label: "Danh sách Cửa hàng", path: "/admin/stores", icon: <ShopOutlined /> },
              { label: "Voucher", path: "/admin/vouchers", icon: <GiftOutlined /> },
            ].map((btn, i) => (
              <Col key={i} xs={12} sm={6}>
                <Button
                  icon={btn.icon}
                  type="primary"
                  block
                  onClick={() => navigate(btn.path)}
                >
                  {btn.label}
                </Button>
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default AdminDashboard;