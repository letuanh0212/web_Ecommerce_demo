// NavbarSeller.jsx
import React from "react";
import { Menu } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const NavbarSeller = () => {
  const items = [
    {
      key: 'products',
      label: 'Products',
      icon: <AppstoreOutlined />,
      children: [
        { key: 'list', label: <Link to="/products">Product List</Link> },
        { key: 'create', label: <Link to="/products/create">Add Product</Link> },
        { key: 'categories', label: <Link to="/categories">Categories</Link> },
      ],
    },
  ];

  return (
    <Menu
      mode="inline"            
      items={items}
      defaultOpenKeys={['products']}
      defaultSelectedKeys={['list']}
      style={{ height: '100vh', borderRight: 0 }}
    />
  );
};

export default NavbarSeller;
