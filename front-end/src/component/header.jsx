import React, { useState, useEffect } from "react";
import { Menu, Badge } from "antd";
import { ShoppingCartOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HeaderSearch from "./search.jsx"; // import component autocomplete

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(location.pathname);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || null);
      setUserRole(token && user ? user.role : null);
    };

    checkLogin();
    window.addEventListener("storageUpdate", checkLogin);
    return () => window.removeEventListener("storageUpdate", checkLogin);
  }, [location]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storageUpdate"));
    navigate("/login");
  };

  // Khi người dùng chọn sản phẩm từ gợi ý
  const handleSearchSelect = (product) => {
    navigate(`/product/${product.id}`);
  };

  const headerStyle = {
    width: "100%",
    background: "#ffffff",
    padding: "10px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  return (
    <div style={headerStyle}>
      {/* Logo */}
      <h2 style={{ margin: 0, fontWeight: "bold", color: "#1677ff" }}>
        <Link to="/" style={{ color: "#1677ff" }}>MyShop</Link>
      </h2>

      {/* SEARCH AUTOCOMPLETE */}
      <div style={{ flex: 1, padding: "0 30px" }}>
        <HeaderSearch onSelectResult={handleSearchSelect} />
      </div>

      {/* CART + ACCOUNT */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/cart">
          <Badge count={0} size="small">
            <ShoppingCartOutlined style={{ fontSize: "24px" }} />
          </Badge>
        </Link>

        <Menu
          onClick={(e) => setCurrent(e.key)}
          selectedKeys={[current]}
          mode="horizontal"
          style={{ borderBottom: "none" }}
          items={[
            userRole
              ? { label: <span onClick={logout}>Logout</span>, key: "logout", icon: <LogoutOutlined /> }
              : {
                  label: "Account",
                  key: "account",
                  icon: <UserOutlined />,
                  children: [
                    { label: <Link to="/login">Login</Link>, key: "/login" },
                    { label: <Link to="/register">Register</Link>, key: "/register" },
                  ],
                },
          ]}
        />
      </div>
    </div>
  );
};

export default Header;
