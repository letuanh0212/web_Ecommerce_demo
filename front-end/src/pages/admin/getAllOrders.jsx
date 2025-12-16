import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Typography,
  Tag,
  Input,
  message,
  Spin,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarCircleOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { getAllOrdersApi } from "../../unti/api";

const { Title } = Typography;

/* =======================
   STATUS UI
======================= */
const getStatusInfo = (status) => {
  switch (status) {
    case "Pending":
      return { color: "orange", icon: <ClockCircleOutlined /> };
    case "Processing":
      return { color: "blue", icon: <DollarCircleOutlined /> };
    case "Shipped":
      return { color: "cyan", icon: <TruckOutlined /> };
    case "Delivered":
    case "Completed":
      return { color: "green", icon: <CheckCircleOutlined /> };
    case "Cancelled":
      return { color: "red", icon: <CloseCircleOutlined /> };
    default:
      return { color: "default", icon: null };
  }
};

const GetAllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  /* =======================
     FETCH ALL ORDERS
  ======================= */
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrdersApi();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        message.error("Dữ liệu đơn hàng không hợp lệ");
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     VIEW DETAIL (TẠM THỜI)
  ======================= */
//   const handleViewDetail = (record) => {
//     message.info(`Xem chi tiết đơn hàng ID: ${record.id}`);
//   };

const handleViewDetails = async (orderRecord) => {
  try {
    setDetailLoading(true);

    const orderDetails = await getOrderDetailApi(orderRecord.id);

    if (orderDetails && typeof orderDetails === "object") {
      setSelectedOrder({
        ...orderDetails,
        user_name: orderRecord.user_name || orderRecord.customer || "Khách lạ",
      });
      setDetailModalVisible(true);
    } else {
      notification.error({
        message: "Dữ liệu chi tiết đơn hàng không hợp lệ",
      });
      setSelectedOrder(null);
    }
  } catch (err) {
    console.error(err);
    notification.error({
      message:
        err.response?.data?.message ||
        "Không tải được chi tiết đơn hàng",
    });
  } finally {
    setDetailLoading(false);
  }
};

  /* =======================
     STATISTICS
  ======================= */
  const totalOrders = orders.length;

  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount || o.total || o.total_amount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (o) => o.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (o) => o.status === "Delivered" || o.status === "Completed"
  ).length;

  /* =======================
     TABLE COLUMNS
  ======================= */
  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "id",
      width: 100,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Khách hàng",
      render: (_, r) => r.user_name || r.customer || "Khách lạ",
    },
    {
      title: "Tổng tiền",
      render: (_, r) =>
        Number(r.totalAmount || r.total || r.total_amount || 0).toLocaleString(
          "vi-VN"
        ) + "₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const info = getStatusInfo(status);
        return (
          <Tag color={info.color} icon={info.icon}>
            {String(status).toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Ngày đặt",
      render: (_, r) =>
        new Date(r.createdAt || r.date || Date.now()).toLocaleDateString(),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        />
      ),
    },
  ];

  /* =======================
     SEARCH
  ======================= */
  const filteredOrders = orders.filter((o) => {
    const s = searchText.toLowerCase();
    return (
      String(o.id).includes(s) ||
      (o.user_name || "").toLowerCase().includes(s)
    );
  });

  return (
    <>
      {/* ===== SUMMARY ===== */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={totalRevenue}
              formatter={(v) => Number(v).toLocaleString("vi-VN")}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Chờ xử lý" value={pendingOrders} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Đã giao" value={deliveredOrders} />
          </Card>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}
      <Card
        title={<Title level={4}>Danh sách đơn hàng toàn hệ thống</Title>}
        extra={
          <Input
            placeholder="Tìm theo ID / Khách hàng"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        }
      >
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredOrders}
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>
    </>
  );
};


export default GetAllOrders;
