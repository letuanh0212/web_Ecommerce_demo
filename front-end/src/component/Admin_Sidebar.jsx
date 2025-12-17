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
      key: "/Admin/dashboard",
      icon: <DashboardOutlined />,
    },

    // ================== Stores ==================
    {
      label: <Link to="stores">Stores</Link>,
      key: "/Admin/stores",
      icon: <ShopOutlined />,
    },

    
    // ================== Orders ==================
    {
      label: <Link to="orders">All Orders</Link>,
      key: "/Admin/orders",
      icon: <ShoppingCartOutlined />,
    },

    // ================== Users ==================
    {
      label: <Link to="users">Users</Link>,
      key: "/Admin/users",
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
          key: "/Admin/vouchers",
        },
        {
          label: <Link to="vouchers/create">Create Voucher</Link>,
          key: "/Admin/vouchers/create",
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