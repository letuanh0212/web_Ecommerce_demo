import React, { useEffect, useState } from "react";
import { Table, Tag, Select, notification, Button, Modal, Descriptions, List, Avatar, Spin, Space } from "antd";
import { getOrdersByStoreApi, updateOrderStatusApi } from "../../unti/api_seller";
import { getOrderDetailApi } from "../../unti/api"; // Import từ file api chung
import { EyeOutlined } from '@ant-design/icons';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const store = JSON.parse(localStorage.getItem("store"));
  const storeId = store?.id;

  useEffect(() => {
    if (storeId) fetchOrders();
  }, [storeId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrdersByStoreApi(storeId);
      setOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      notification.error({ message: "Lỗi tải đơn hàng" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      notification.success({ message: "Cập nhật trạng thái thành công" });
      fetchOrders(); // Load lại bảng
    } catch (err) {
      notification.error({ message: "Cập nhật thất bại" });
    }
  };

  const handleViewDetail = async (orderRecord) => {
    try {
      setDetailLoading(true);
      // API trả về chi tiết đơn hàng, nhưng có thể không có user_name
      // nên chúng ta sẽ lấy user_name từ bản ghi (record) của bảng
      const orderDetails = await getOrderDetailApi(orderRecord.id);
      console.log("check>>>>>>>>>>",orderDetails)
      if (orderDetails && typeof orderDetails === 'object') {
        console.log("check>>>>>>>>>>",orderDetails)
        setSelectedOrder({ ...orderDetails, user_name: orderRecord.user_name });
        setDetailModalVisible(true);
      } else {
        notification.error({ message: "Dữ liệu chi tiết đơn hàng không hợp lệ." });
        setSelectedOrder(null);
      }
    } catch (err) {
      notification.error({ message: err.response?.data?.message || "Không tải được chi tiết đơn hàng" });
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { text: "Chờ duyệt", color: "gold" },
      processing: { text: "Đang xử lý", color: "blue" },
      shipped: { text: "Đã gửi", color: "cyan" },
      completed: { text: "Hoàn thành", color: "green" },
      cancelled: { text: "Đã hủy", color: "red" },
    };
    return statusMap[status] || { text: status, color: "default" };
  };

  const columns = [
    { title: "ID Đơn", dataIndex: "id", width: 80 },
    { title: "Khách hàng", dataIndex: "user_name" },
    { 
      title: "Tổng tiền", 
      dataIndex: "final_amount",
      render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
    },
    { title: "Ngày đặt", dataIndex: "createdAt", render: (date) => new Date(date).toLocaleString() },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const { text, color } = getStatusInfo(status);
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          <Select
            defaultValue={record.status}
            style={{ width: 140 }}
            onChange={(val) => handleStatusChange(record.id, val)}
            disabled={record.status === 'cancelled' || record.status === 'completed'}
          >
            <Select.Option value="pending">Chờ duyệt</Select.Option>
            <Select.Option value="processing">Đang xử lý</Select.Option>
            <Select.Option value="shipped">Đã gửi</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Quản lý Đơn hàng</h2>
        <Button onClick={fetchOrders}>Làm mới</Button>
      </div>
      <Table 
        dataSource={orders} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
      />

      <Modal
        title={selectedOrder ? `Chi tiết đơn hàng #${selectedOrder.id}` : "Chi tiết đơn hàng"}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        <Spin spinning={detailLoading}>
          {selectedOrder ? (
            <div>
              <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Khách hàng">{selectedOrder.user_name}</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">{new Date(selectedOrder.createdAt).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Tag color={getStatusInfo(selectedOrder.status).color}>
                    {getStatusInfo(selectedOrder.status).text}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.total_amount)}</Descriptions.Item>
                <Descriptions.Item label="Thành tiền">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.final_amount)}</Descriptions.Item>
              </Descriptions>

              <h3>Các sản phẩm</h3>
              <List
                itemLayout="horizontal"
                dataSource={selectedOrder.items}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.item_image || 'https://via.placeholder.com/150'} />}
                      title={item.item_name}
                      description={`Số lượng: ${item.quantity} - Đơn giá: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}`}
                    />
                    <div>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}</div>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <p>Không có dữ liệu để hiển thị.</p>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default OrderList;