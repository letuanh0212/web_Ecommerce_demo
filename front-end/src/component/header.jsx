import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { AppstoreOutlined, MailOutlined, ShoppingCartOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(location.pathname);
  const [userRole, setUserRole] = useState(null); // lưu role user/seller

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (token && user) {
        setUserRole(user.role); // 'user' hoặc 'seller'
      } else {
        setUserRole(null); // chưa login
      }
    };

    checkLogin();
    window.addEventListener("storageUpdate", checkLogin);

    return () => window.removeEventListener("storageUpdate", checkLogin);
  }, [location]);

  const onClick = e => setCurrent(e.key);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storageUpdate"));
    navigate("/login");
  };

  const guestMenu = [
    { label: <Link to="/">Home</Link>, key: '/', icon: <MailOutlined /> },
    {
      label: 'Account',
      key: 'account',
      icon: <AppstoreOutlined />,
      children: [
        { label: <Link to="/login">Login</Link>, key: '/login' },
        { label: <Link to="/register">Register</Link>, key: '/register' },
      ],
    },
  ];

  const userMenu = [
    { label: <Link to="/">Home</Link>, key: '/', icon: <MailOutlined /> },
    { label: <Link to="/cart">Cart</Link>, key: '/cart', icon: <ShoppingCartOutlined /> },
    { label: <span onClick={logout}>Logout</span>, key: 'logout', icon: <LogoutOutlined /> },
  ];

  const sellerMenu = [
    { label: <Link to="/">Home</Link>, key: '/', icon: <MailOutlined /> },
    { label: <Link to="/seller-store">Seller Store</Link>, key: '/seller-store', icon: <ShoppingCartOutlined /> },
    { label: <span onClick={logout}>Logout</span>, key: 'logout', icon: <LogoutOutlined /> },
  ];


  let menuToShow = guestMenu;
  if (userRole === 'user') menuToShow = userMenu;
  else if (userRole === 'seller') menuToShow = sellerMenu;

  return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={menuToShow} />;
};

export default Header;
