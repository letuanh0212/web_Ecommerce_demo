import React, { useEffect, useState } from "react";
import { Table, Button, message, Tag, Card, Typography, Modal, Form, Input, Select, DatePicker, InputNumber, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getVouchersApi,
  createVoucherApi,
  updateVoucherApi,
  deleteVoucherApi,
} from "../../unti/api_seller";

const { Title } = Typography;
const { Option } = Select;

// Mock store id for seller context; will attempt to read from localStorage
const DEFAULT_STORE_ID = 1;

const SellerVoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form] = Form.useForm();
  const [debugValues, setDebugValues] = useState(null);
  const [storeId, setStoreId] = useState(DEFAULT_STORE_ID);

  useEffect(() => {
    // try to read store from localStorage (set by login or store fetch)
    try {
      const storeStr = localStorage.getItem('store') || sessionStorage.getItem('store');
      if (storeStr) {
        const store = JSON.parse(storeStr);
        if (store && store.id) setStoreId(store.id);
      }
    } catch (e) {
      // ignore parse errors
    }
    // fetch using the real store id if available
    try {
      const storeStr = localStorage.getItem('store') || sessionStorage.getItem('store');
      if (storeStr) {
        const store = JSON.parse(storeStr);
        if (store && store.id) {
          fetchVouchers(store.id);
          return;
        }
      }
    } catch (e) {}
    fetchVouchers();
  }, []);

  const fetchVouchers = async (forStoreId) => {
    setLoading(true);
    try {
      const sid = forStoreId || storeId || DEFAULT_STORE_ID;
      const res = await getVouchersApi(sid);
      // assume response data shape: { data: [...] } or res.data
      const data = res.data || res.vouchers || [];
      setVouchers(data);
    } catch (err) {
      message.error("Lỗi tải voucher");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingVoucher(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEdit = (record) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      ...record,
      start_date: dayjs(record.start_date),
      end_date: dayjs(record.end_date),
    });
    setModalVisible(true);
  };

  const removeVoucher = async (id) => {
    try {
      await deleteVoucherApi(id);
      message.success("Xóa voucher thành công");
      fetchVouchers();
    } catch (err) {
      message.error("Lỗi xóa voucher");
    }
  };

  const validateForm = (values) => {
    if (!values.discount_value || Number(values.discount_value) <= 0) {
      message.error("Giá trị giảm phải lớn hơn 0");
      return false;
    }
    if (values.discount_type === "percent" && Number(values.discount_value) > 100) {
      message.error("Phần trăm giảm phải <= 100");
      return false;
    }
    if (!dayjs(values.end_date).isAfter(values.start_date)) {
      message.error("Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }
    return true;
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        code: values.code,
        description: values.description || null,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        min_order_value: values.min_order_value || 0,
        quantity: values.quantity || 1,
        max_uses_per_user: values.max_uses_per_user || 1,
        start_date: dayjs(values.start_date).format("YYYY-MM-DD HH:mm:ss"),
        end_date: dayjs(values.end_date).format("YYYY-MM-DD HH:mm:ss"),
        store_id: storeId || DEFAULT_STORE_ID,
        applies_to_all_users: values.applies_to_all_users ? 1 : 0,
      };

      if (!validateForm(values)) return;

      if (editingVoucher) {
        await updateVoucherApi(editingVoucher.id, payload);
        message.success("Cập nhật voucher thành công");
      } else {
        await createVoucherApi(payload);
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
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (c) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: "Discount",
      dataIndex: "discount_value",
      key: "discount",
      render: (val, rec) => (rec.discount_type === "percent" ? `${val}%` : `${Number(val).toLocaleString()} VND`),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Time Range",
      dataIndex: "start_date",
      key: "time",
      render: (_, rec) => `${dayjs(rec.start_date).format("YYYY-MM-DD")} → ${dayjs(rec.end_date).format("YYYY-MM-DD")}`,
    },
    {
      title: "Status",
      key: "status",
      render: (_, rec) => {
        const now = dayjs();
        const start = dayjs(rec.start_date);
        const end = dayjs(rec.end_date);
        const active = (now.isAfter(start) || now.isSame(start)) && (now.isBefore(end) || now.isSame(end)) && rec.quantity > 0;
        return active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_, rec) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => openEdit(rec)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => removeVoucher(rec.id)} style={{ marginLeft: 8 }} />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>Vouchers</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ marginBottom: 16 }}>
        Create Voucher
      </Button>
      <Card>
        <Table columns={columns} dataSource={vouchers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={editingVoucher ? "Edit Voucher" : "Create Voucher"} open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={(errorInfo) => {
            console.error('Form submit failed:', errorInfo);
            try {
              const current = form.getFieldsValue(true);
              console.warn('Current form values at failure:', current);
            } catch (e) {
              console.warn('Could not read form values', e);
            }
            if (errorInfo && errorInfo.errorFields) {
              const list = errorInfo.errorFields.map(f => ({ name: f.name, errors: f.errors }));
              console.warn('Field errors:', list);
            }
          }}
          onValuesChange={(changed, all) => {
            setDebugValues(all);
            // console.debug('form values changed', changed, all);
          }}
        >
          <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Code is required' }]}> 
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>

          <Form.Item name="discount_type" label="Discount Type" rules={[{ required: true, message: 'Discount type is required' }]}> 
            <Select>
              <Option value="percent">Percent</Option>
              <Option value="fixed">Fixed</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="discount_value"
            label="Discount Value"
            rules={[
              { required: true, message: 'Discount value is required' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value === undefined || value === null || value === '') return Promise.reject(new Error('Discount value is required'));
                  const type = getFieldValue('discount_type');
                  if (Number(value) <= 0) return Promise.reject(new Error('Discount value must be greater than 0'));
                  if (type === 'percent' && Number(value) > 100) return Promise.reject(new Error('Percent discount must be <= 100'));
                  return Promise.resolve();
                }
              })
            ]}
          >
            <InputNumber min={0.01} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="min_order_value" label="Min Order Value">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="quantity" label="Quantity">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="max_uses_per_user" label="Max Uses Per User">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="applies_to_all_users" label="Applies To All Users" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[
              { required: true, message: 'Start date is required' },
              () => ({
                validator(_, value) {
                  if (!value) return Promise.reject(new Error('Start date is required'));
                  if (!dayjs(value).isValid()) return Promise.reject(new Error('Start date is invalid'));
                  return Promise.resolve();
                }
              })
            ]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="End Date"
            rules={[
              { required: true, message: 'End date is required' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue('start_date');
                  if (!value) return Promise.reject(new Error('End date is required'));
                  if (!dayjs(value).isValid()) return Promise.reject(new Error('End date is invalid'));
                  if (start && !dayjs(value).isAfter(dayjs(start))) return Promise.reject(new Error('End date must be after start date'));
                  return Promise.resolve();
                }
              })
            ]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit"> {editingVoucher ? "Update" : "Create"} </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SellerVoucherManagement;
