import React, { useState, useEffect } from "react";
import { Menu, Badge } from "antd";
import {
  ShoppingCartOutlined,
  LogoutOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HeaderSearch from "./search.jsx";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(location.pathname);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkLogin = () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const user = JSON.parse(
        localStorage.getItem("user") ||
          sessionStorage.getItem("user") ||
          null
      );

      if (token && user) {
        setUserRole(user.role);
      } else {
        setUserRole(null);
      }
    };

    checkLogin();
    window.addEventListener("storageUpdate", checkLogin);

    return () => window.removeEventListener("storageUpdate", checkLogin);
  }, [location]);


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.dispatchEvent(new Event("storageUpdate"));
    navigate("/login");
  };


  const handleSearchSelect = (product) => {
    if (product.isSearchText) {
      // Enter để tìm kiếm theo text
      navigate(`/search?query=${product.name}`);
    } else {
      // Chọn product trong dropdown
      navigate(`/product/${product.id}`);
    }
  };

  // Guest (chưa login)
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

  // User đã login
  const userItems = [
    { label: <Link to="/blog">Blog</Link>, key: "blog", icon: <ReadOutlined /> },

    {
      label: <span onClick={logout}>Sign Out</span>,
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const menuItems = userRole ? userItems : guestItems;


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
    <div style={headerStyle}>
      {/* LOGO */}
      <h2 style={{ margin: 0, fontWeight: "bold", fontSize: "24px" }}>
        <Link to="/" style={{ color: "#1677ff", textDecoration: "none" }}>
          MyShop
        </Link>
      </h2>

      {/* SEARCH BAR */}
      <HeaderSearch
            onSelectResult={(item) => {
              if (item?.isSearchText) {
                navigate(`/search?q=${item.name}`);
              } else {
                navigate(`/product/${item.id}`);
              }
            }}
       />


      {/* RIGHT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {/* CART */}
        <Link
          to="/cart"
          style={{
            display: "flex",
            alignItems: "center",
            color: "inherit",
          }}
        >
          <Badge count={0} size="small" showZero>
            <ShoppingCartOutlined style={{ fontSize: "22px", color: "#555" }} />
          </Badge>
        </Link>

        {/* MENU ACCOUNT */}
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
  );
};

export default Header;
