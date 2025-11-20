import React, { useState } from 'react';
import { Menu } from 'antd';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [current, setCurrent] = useState(location.pathname);

  const onClick = e => {
    setCurrent(e.key);
  };

  const items = [
    {
      label: <Link to="/">Home</Link>,
      key: '/',
      icon: <MailOutlined />,
    },
    {
      label: <Link to="/user">User</Link>,
      key: '/user',
      icon: <AppstoreOutlined />,
    },
    {
      label: 'Login',
      key: '/login',
      icon: <SettingOutlined />,
      children: [
        { label: <Link to="/login">Login</Link>, key: '/login' },
        { label: <Link to="/register">Register</Link>, key: '/register' },
      ],
    },
  ];

  return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;
