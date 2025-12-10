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
        // 1) Users
        let usersCount = 0;
        try {
          const users = await api.get('/api/users');
          if (Array.isArray(users)) usersCount = users.length;
        } catch (err) {
          if (handle401(err)) return;
          // ignore, leave as 0
        }

        // 2) Stores (try /api/stores then /api/sellers)
        let storesCount = 0;
        try {
          const stores = await api.get('/api/stores');
          if (Array.isArray(stores)) storesCount = stores.length;
        } catch (err) {
          if (handle401(err)) return;
          try {
            const sellers = await api.get('/api/sellers');
            if (Array.isArray(sellers)) storesCount = sellers.length;
          } catch (err2) {
            if (handle401(err2)) return;
            // ignore
          }
        }

        // 3) Products / Items
        let productsCount = 0;
        try {
          const items = await api.get('/api/items');
          if (Array.isArray(items)) productsCount = items.length;
        } catch (err) {
          if (handle401(err)) return;
        }

        // 4) Orders - try to fetch all orders (backend may paginate)
        let ordersCount = 0;
        let ordersList = [];
        try {
          const orders = await api.get('/api/orders');
          if (Array.isArray(orders)) {
            ordersCount = orders.length;
            ordersList = orders;
          } else if (orders && orders.data && Array.isArray(orders.data)) {
            ordersCount = orders.data.length;
            ordersList = orders.data;
          }
        } catch (err) {
          if (handle401(err)) return;
          // Try fallback endpoint `/api/orders/recent` or `/api/orders?limit=5`
          try {
            const recent = await api.get('/api/orders/recent');
            if (Array.isArray(recent)) {
              ordersCount = recent.length;
              ordersList = recent;
            }
          } catch (_) { /* ignore */ }
        }

        // 5) Vouchers (optional)
        let vouchersCount = 0;
        try {
          const vouchers = await api.get('/api/vouchers');
          if (Array.isArray(vouchers)) vouchersCount = vouchers.length;
        } catch (err) {
          if (handle401(err)) return;
        }

        // 6) Revenue & charts - best effort:
        let totalRevenue = 0;
        // If ordersList has order.total and order.createdAt fields, we can compute revenue by month.
        if (Array.isArray(ordersList) && ordersList.length > 0) {
          // compute total revenue
          totalRevenue = ordersList.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

          // build revenue per last 6 months
          const now = new Date();
          const months = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getMonth() + 1}/${d.getFullYear()}`; // MM/YYYY
            months.push({ key, value: 0 });
          }
          const monthIndexMap = Object.fromEntries(months.map((m, idx) => [m.key, idx]));

          ordersList.forEach(o => {
            const ts = o.createdAt || o.date || o.created_at || o.order_date;
            const total = Number(o.total) || 0;
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
            // convert to millions for UI (like "3.2" in original)
            return { month: m.key, value: Math.round((m.value / 1000000) * 10) / 10 };
          });
          setRevenueData(revenueChart);

          // top items: if order items available
          const itemCounts = {};
          ordersList.forEach(o => {
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
          // fallback: keep static minimal data if no orders available
          setRevenueData([
            { month: "T1", value: 3.2 },
            { month: "T2", value: 4.1 },
            { month: "T3", value: 5.8 },
            { month: "T4", value: 4.6 },
            { month: "T5", value: 8.2 },
            { month: "T6", value: 9.3 },
          ]);
          setTopItems([
            { name: "Áo Thun", sold: 520 },
            { name: "Tai nghe", sold: 410 },
            { name: "Balo", sold: 290 },
            { name: "Giày", sold: 260 },
            { name: "Điện thoại", sold: 180 },
          ]);
        }

        // recent orders (take 5 most recent from ordersList)
        const recent = (Array.isArray(ordersList) ? ordersList.slice().sort((a, b) => {
          const da = new Date(a.createdAt || a.date || a.created_at || a.order_date || 0).getTime();
          const db = new Date(b.createdAt || b.date || b.created_at || b.order_date || 0).getTime();
          return db - da;
        }).slice(0, 5) : []).map((o, idx) => ({
          key: o.id || o._id || idx,
          orderId: o.code || (o.id ? `#${o.id}` : `#${idx + 1}`),
          customer: (o.user && (o.user.name || o.user.fullName)) || o.customerName || o.customer || 'Khách lạ',
          total: Number(o.total) || 0,
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
          <Spin tip="Đang tải dữ liệu..." size="large" />
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