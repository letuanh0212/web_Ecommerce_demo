import { Menu } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  AppstoreOutlined,
  TagsOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  LogoutOutlined,
  PictureOutlined,
  ClusterOutlined,
  ContainerOutlined
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    // ================== Dashboard ==================
    {
      label: <Link to="dashboard">Dashboard</Link>,
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
    },

    // ================== Stores ==================
    {
      label: "Stores",
      key: "stores",
      icon: <ShopOutlined />,
      children: [
        {
          label: <Link to="stores">All Stores</Link>,
          key: "/admin/stores",
        },
      ],
    },

    // ================== Products ==================
    {
      label: "Products",
      key: "products",
      icon: <AppstoreOutlined />,
      children: [
        {
          label: <Link to="categories">Categories</Link>,
          key: "/admin/categories",
          icon: <ClusterOutlined />,
        },
        {
          label: <Link to="items">Items</Link>,
          key: "/admin/items",
        },
        {
          label: <Link to="variants">Item Variants</Link>,
          key: "/admin/variants",
        },
        {
          label: <Link to="item-images">Item Images</Link>,
          key: "/admin/item-images",
          icon: <PictureOutlined />,
        },
      ],
    },

    // ================== Orders ==================
    {
      label: "Orders",
      key: "orders",
      icon: <ShoppingCartOutlined />,
      children: [
        {
          label: <Link to="orders">All Orders</Link>,
          key: "/admin/orders",
        },
        {
          label: <Link to="orders/pending">Pending Orders</Link>,
          key: "/admin/orders/pending",
        },
        {
          label: <Link to="orders/completed">Completed Orders</Link>,
          key: "/admin/orders/completed",
        },
      ],
    },

    // ================== Users ==================
    {
      label: <Link to="users">Users</Link>,
      key: "/admin/users",
      icon: <UserOutlined />,
    },

    // ================== Vouchers ==================
    {
      label: "Vouchers",
      key: "vouchers",
      icon: <TagsOutlined />,
      children: [
        {
          label: <Link to="vouchers">All Vouchers</Link>,
          key: "/admin/vouchers",
        },
        {
          label: <Link to="vouchers/create">Create Voucher</Link>,
          key: "/admin/vouchers/create",
        },
      ],
    },

    // ================== Logout ==================
    {
      label: <span onClick={logout}>Logout</span>,
      key: "logout",
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <div style={{ width: 210, height: "100vh", borderRight: "1px solid #f0f0f0" }}>
      <h3 style={{ padding: "16px" }}>Admin Panel</h3>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["products", "orders", "vouchers", "reports"]}
        items={menuItems}
      />
    </div>
  );
}
