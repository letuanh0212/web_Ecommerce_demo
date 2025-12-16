import React, { useEffect, useState } from "react";
import { Table, Button, message, Tag, Card, Typography, Modal, Form, Input, Select, DatePicker, InputNumber } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "../../unti/axios.cusomize";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

const VoucherSeller = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form] = Form.useForm();
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Giả sử storeId từ user
      setStoreId(user.storeId || 1); // Thay bằng logic lấy storeId thực
      fetchVouchers();
    }
  }, []);

  const fetchVouchers = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/vouchers/store/${storeId}`);
      setVouchers(res.vouchers || []);
    } catch (err) {
      message.error("Lỗi tải voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVoucher(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      ...record,
      start_date: moment(record.start_date),
      end_date: moment(record.end_date),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/vouchers/${id}`);
      message.success("Xóa voucher thành công");
      fetchVouchers();
    } catch (err) {
      message.error("Lỗi xóa voucher");
    }
  };

  const handleSubmit = async (values) => {
    try {
      values.start_date = values.start_date.format("YYYY-MM-DD HH:mm:ss");
      values.end_date = values.end_date.format("YYYY-MM-DD HH:mm:ss");
      values.store_id = storeId;

      if (editingVoucher) {
        await axios.put(`/api/vouchers/${editingVoucher.id}`, values);
        message.success("Cập nhật voucher thành công");
      } else {
        await axios.post("/api/vouchers", values);
        message.success("Tạo voucher thành công");
      }
      setModalVisible(false);
      fetchVouchers();
    } catch (err) {
      message.error("Lỗi lưu voucher");
    }
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Giảm giá",
      dataIndex: "discount_value",
      key: "discount_value",
      render: (value, record) => (
        <span>
          {record.discount_type === "percent" ? `${value}%` : `${value.toLocaleString()} VND`}
        </span>
      ),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "min_order_value",
      key: "min_order_value",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Hết hạn",
      dataIndex: "end_date",
      key: "end_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
            style={{ marginLeft: 8 }}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Quản lý Voucher</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ marginBottom: 16 }}>
        Tạo Voucher
      </Button>
      <Card>
        <Table
          columns={columns}
          dataSource={vouchers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingVoucher ? "Chỉnh sửa Voucher" : "Tạo Voucher"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="code" label="Mã voucher" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="discount_type" label="Loại giảm giá" rules={[{ required: true }]}>
            <Select>
              <Option value="percent">Phần trăm</Option>
              <Option value="fixed">Cố định</Option>
            </Select>
          </Form.Item>
          <Form.Item name="discount_value" label="Giá trị giảm" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="min_order_value" label="Đơn tối thiểu" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="start_date" label="Ngày bắt đầu" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="end_date" label="Ngày kết thúc" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingVoucher ? "Cập nhật" : "Tạo"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VoucherSeller;