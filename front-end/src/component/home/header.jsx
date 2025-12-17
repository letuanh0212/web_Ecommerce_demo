import React, { useState, useEffect } from "react";
import { Menu, Badge, Button, Modal, List, Tag, Empty, message } from "antd";
import {
  ShoppingCartOutlined,
  LogoutOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
  ReadOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HeaderSearch from "../search.jsx";
import axios from "../../unti/axios.cusomize.js";
import { getCart } from "../../unti/cart.js";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [current, setCurrent] = useState(location.pathname);
  const [userRole, setUserRole] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [userVouchers, setUserVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // ======================
  // 1. CHECK LOGIN + CART
  // ======================
  useEffect(() => {
    const checkLogin = () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const user = JSON.parse(
        localStorage.getItem("user") ||
          sessionStorage.getItem("user") ||
          null
      );

      setUserRole(token && user ? user.role : null);
    };

    const checkCart = () => {
      try {
        const cart = getCart();
        const qty = Array.isArray(cart)
          ? cart.reduce((s, item) => s + (item.quantity || 0), 0)
          : 0;
        setCartCount(qty);
      } catch {
        setCartCount(0);
      }
    };

    checkLogin();
    checkCart();

    window.addEventListener("storageUpdate", checkLogin);
    window.addEventListener("storageUpdate", checkCart);

    return () => {
      window.removeEventListener("storageUpdate", checkLogin);
      window.removeEventListener("storageUpdate", checkCart);
    };
  }, [location]);

  // ======================
  // 2. LOGOUT
  // ======================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.dispatchEvent(new Event("storageUpdate"));
    navigate("/login");
  };

  const fetchUserVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const res = await axios.get("/api/user-vouchers");
      if (res && res.vouchers) setUserVouchers(res.vouchers);
      else setUserVouchers([]);
    } catch (err) {
      console.warn("Could not fetch user vouchers:", err);
      message.error("Không tải được voucher");
    } finally {
      setLoadingVouchers(false);
    }
  };

  const openVoucherModal = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      message.warning("Bạn cần đăng nhập để xem voucher");
      navigate("/login");
      return;
    }
    setVoucherModalVisible(true);
    fetchUserVouchers();
  };

  // ======================
  // 3. SEARCH HANDLER
  // ======================
  const handleSearchSelect = (item) => {
    if (item?.isSearchText) {
      navigate(`/search?q=${item.name}`);
    } else {
      navigate(`/product/${item.id}`);
    }
  };

  // ======================
  // 4. MENU ITEMS
  // ======================

  const guestItems = [
    { label: <Link to="/blog">Blog</Link>, key: "blog", icon: <ReadOutlined /> },

    {
      label: "Account",
      key: "account",
      icon: <UserOutlined />,
      children: [
        {
          label: <Link to="/login">Login</Link>,
          key: "/login",
          icon: <LoginOutlined />,
        },
        {
          label: <Link to="/register">Register</Link>,
          key: "/register",
          icon: <UserAddOutlined />,
        },
      ],
    },
  ];

  const userItems = [
    { label: <Link to="/blog">Blog</Link>, key: "blog", icon: <ReadOutlined /> },

    { label: <Link to="/orders">Lịch sử đơn hàng</Link>, key: "orders", icon: <ShoppingCartOutlined /> },

    { label: <span onClick={openVoucherModal}>Voucher</span>, key: "vouchers", icon: <GiftOutlined /> },

    {
      label: <span onClick={logout}>Sign Out</span>,
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const menuItems = userRole ? userItems : guestItems;

  // ======================
  // 5. UI LAYOUT
  // ======================
  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
    background: "#fff",
    padding: "0 50px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  return (
    <>
    <div style={headerStyle}>
      {/* LOGO */}
      <h2 style={{ margin: 0, fontWeight: "bold", fontSize: "24px" }}>
        <Link to="/" style={{ color: "#1677ff", textDecoration: "none" }}>
          MyShop
        </Link>
      </h2>

      {/* SEARCH BAR */}
      <div style={{ flex: 1, padding: "0 40px", maxWidth: "600px" }}>
        <HeaderSearch onSelectResult={handleSearchSelect} />
      </div>

      {/* RIGHT MENU */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {/* CART ICON */}
        <Link
          to="/cart"
          style={{ display: "flex", alignItems: "center", color: "inherit" }}
        >
          <Badge count={cartCount} size="small" showZero>
            <ShoppingCartOutlined style={{ fontSize: "22px", color: "#555" }} />
          </Badge>
        </Link>


        {/* ACCOUNT MENU */}
        <Menu
          onClick={(e) => setCurrent(e.key)}
          selectedKeys={[current]}
          mode="horizontal"
          items={menuItems}
          style={{
            background: "transparent",
            borderBottom: "none",
            minWidth: "100px",
            justifyContent: "flex-end",
          }}
        />
      </div>
    </div>

    <Modal
      title="Voucher của bạn"
      open={voucherModalVisible}
      onCancel={() => setVoucherModalVisible(false)}
      footer={null}
    >
      {loadingVouchers ? (
        <div>Đang tải...</div>
      ) : userVouchers && userVouchers.length > 0 ? (
        <List
          dataSource={userVouchers}
          renderItem={(v) => {
            const now = new Date();
            const isActive = new Date(v.start_date) <= now && new Date(v.end_date) >= now;
            return (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong>{v.code}</strong>
                      <Tag color={isActive ? "green" : "orange"}>{isActive ? "Hoạt động" : "Hết hạn"}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div>
                        {v.discount_type === "percent" ? (
                          <Tag color="blue">{v.discount_value}%</Tag>
                        ) : (
                          <Tag color="blue">{new Intl.NumberFormat('vi-VN').format(v.discount_value)} VND</Tag>
                        )}
                        <span style={{ marginLeft: 8, color: '#888' }}>Min: {new Intl.NumberFormat('vi-VN').format(v.min_order_value)} VND</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
                        Store: {v.store_name || 'Tất cả'} • Sử dụng: {v.used_count}/{v.max_uses} • Hết hạn: {new Date(v.end_date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty description="Không có voucher" />
      )}
    </Modal>

    </>
  );
};

export default Header;
