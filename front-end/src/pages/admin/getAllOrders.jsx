// src/pages/admin/GetAllOrders.jsx

import React, { useState, useEffect } from "react";
import { 
    Table, Button, Card, Typography, Tag, Input, Space, Popconfirm, message, Spin, Row, Col, Statistic
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
    DollarOutlined
} from "@ant-design/icons";
//import { getAllOrdersApi, updateOrderStatusApi } from "../../unti/api";

const { Title } = Typography;

// Dữ liệu giả định Đơn hàng
const initialOrdersData = [
    { 
        key: 1, 
        id: 10001, 
        customer: "Lê Văn C", 
        store_name: "Fashion Zone 24/7", 
        total_amount: 550000, 
        status: "Pending", 
        date: "2025-12-03" 
    },
    { 
        key: 2, 
        id: 10002, 
        customer: "Đức Trọng", 
        store_name: "Tech Global", 
        total_amount: 1200000, 
        status: "Processing", 
        date: "2025-12-02" 
    },
    { 
        key: 3, 
        id: 10003, 
        customer: "Hồng Nhung", 
        store_name: "Sách Cũ Vintage", 
        total_amount: 300000, 
        status: "Shipped", 
        date: "2025-12-01" 
    },
    { 
        key: 4, 
        id: 10004, 
        customer: "Văn Hải", 
        store_name: "Fashion Zone 24/7", 
        total_amount: 950000, 
        status: "Delivered", 
        date: "2025-11-30" 
    },
    { 
        key: 5, 
        id: 10005, 
        customer: "Phạm Thu D", 
        store_name: "Tech Global", 
        total_amount: 150000, 
        status: "Cancelled", 
        date: "2025-11-29" 
    },
];

// Icon + màu cho Status
const getStatusInfo = (status) => {
    switch (status) {
        case "Pending": return { color: "orange", icon: <ClockCircleOutlined /> };
        case "Processing": return { color: "blue", icon: <DollarCircleOutlined /> };
        case "Shipped": return { color: "cyan", icon: <TruckOutlined /> };
        case "Delivered": return { color: "green", icon: <CheckCircleOutlined /> };
        case "Cancelled": return { color: "red", icon: <CloseCircleOutlined /> };
        default: return { color: "default", icon: null };
    }
};

const GetAllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);

    // Lấy dữ liệu orders từ API
    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        setLoading(true);
        try {
            const response = await getAllOrdersApi();
            if (response?.data?.data) {
                setOrders(response.data.data);
            } else if (Array.isArray(response?.data)) {
                setOrders(response.data);
            } else {
                message.error("Không thể tải danh sách đơn hàng");
            }
        } catch (error) {
            console.error("Lỗi khi lấy orders:", error);
            message.error("Lỗi khi tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    // Xem chi tiết
    const handleViewDetails = (record) => {
        alert(`Xem chi tiết Đơn hàng ID: ${record.id || record._id}`);
    };

    // Hủy đơn hàng
    const handleCancelOrder = async (id, customer) => {
        try {
            await updateOrderStatusApi(id, "Cancelled");
            setOrders(orders.map(order =>
                order.id === id || order._id === id ? { ...order, status: "Cancelled" } : order
            ));
            message.warning(`Đã HỦY đơn hàng ID ${id} của ${customer}.`);
        } catch (error) {
            console.error("Lỗi khi hủy order:", error);
            message.error("Không thể hủy đơn hàng");
        }
    };

    // Tính toán thống kê
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || order.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === "Pending").length;
    const deliveredOrders = orders.filter(o => o.status === "Delivered").length;

    // Cột bảng
    const orderColumns = [
        { title: "Mã Đơn", dataIndex: "id", sorter: (a, b) => a.id - b.id, width: 100 },
        { 
            title: "Khách hàng", 
            dataIndex: "customer",
            sorter: (a, b) => a.customer.localeCompare(b.customer)
        },
        {
            title: "Cửa hàng",
            dataIndex: "store_name",
            filters: [...new Set(orders.map(o => o.store_name))].map(name => ({ text: name, value: name })),
            onFilter: (value, record) => record.store_name.includes(value),
        },
        { 
            title: "Tổng tiền", 
            dataIndex: "total_amount",
            render: amount => amount.toLocaleString("vi-VN") + "₫",
            sorter: (a, b) => a.total_amount - b.total_amount,
            width: 150
        },
        { 
            title: "Trạng thái",
            dataIndex: "status",
            filters: [
                { text: "Chờ xử lý", value: "Pending" },
                { text: "Đang xử lý", value: "Processing" },
                { text: "Đang giao", value: "Shipped" },
                { text: "Đã giao", value: "Delivered" },
                { text: "Đã hủy", value: "Cancelled" },
            ],
            onFilter: (value, record) => record.status.includes(value),
            render: (status) => {
                const info = getStatusInfo(status);
                return (
                    <Tag icon={info.icon} color={info.color}>
                        {status.toUpperCase()}
                    </Tag>
                );
            }
        },
        { title: "Ngày đặt", dataIndex: "date", width: 120 },

        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    {/* Xem chi tiết */}
                    <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewDetails(record)}
                    />

                    {/* Hủy đơn nếu chưa delivered hoặc cancelled */}
                    {record.status !== "Delivered" && record.status !== "Cancelled" && (
                        <Popconfirm
                            title={`Hủy Đơn hàng ID: ${record.id}`}
                            description="Bạn có chắc chắn muốn hủy? Không thể hoàn tác."
                            onConfirm={() => handleCancelOrder(record.id, record.customer)}
                            okText="Hủy Đơn"
                            cancelText="Không"
                        >
                            <Button icon={<CloseCircleOutlined />} danger size="small" />
                        </Popconfirm>
                    )}
                </Space>
            ),
            width: 150
        }
    ];

    // Tìm kiếm
    const filteredOrders = orders.filter(order => {
        const orderId = String(order.id || order._id || "");
        const customerName = (order.customer || order.userId?.name || "").toLowerCase();
        const storeName = (order.store_name || order.storeId?.name || "").toLowerCase();
        const searchLower = searchText.toLowerCase();
        
        return (
            orderId.includes(searchText) ||
            customerName.includes(searchLower) ||
            storeName.includes(searchLower)
        );
    });

    return (
        <>
            {/* Thống kê */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng Đơn Hàng"
                            value={totalOrders}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng Doanh Thu"
                            value={totalRevenue}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            valueStyle={{ color: '#52c41a' }}
                            formatter={(value) => (value || 0).toLocaleString('vi-VN')}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chờ Xử Lý"
                            value={pendingOrders}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã Giao"
                            value={deliveredOrders}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={<Title level={4}>Quản Lý Đơn Hàng Toàn Hệ Thống</Title>}
                extra={
                    <Input 
                        placeholder="Tìm kiếm ID / Khách hàng / Store..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 350 }}
                    />
                }
                style={{ borderRadius: 8 }}
            >
                <Spin spinning={loading}>
                    <Table
                        columns={orderColumns}
                        dataSource={filteredOrders}
                        rowKey={(record) => record.id || record._id}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: "max-content" }}
                    />
                </Spin>
            </Card>
        </>
    );
};

export default GetAllOrders;
