import React, { useEffect, useState } from "react";
import { Table, Button, Card, Typography, Tag, Input, Space, Popconfirm, message, notification, Spin, Modal } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import api from "../../unti/axios.cusomize";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'green';
    case 'pending': return 'orange';
    case 'banned': return 'red';
    default: return 'default';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'approved': return 'Được phép bán';
    case 'pending': return 'Chờ duyệt';
    case 'banned': return 'Bị khóa';
    default: return status;
  }
};

const GetAllStores = () => {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal reason for rejection
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingStoreId, setRejectingStoreId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy stores
        let storesRes = [];
        try {
          storesRes = await api.get('/api/stores');
        } catch (err) {
          try {
            storesRes = await api.get('/api/sellers');
          } catch (err2) {
            throw err;
          }
        }

        if (!Array.isArray(storesRes)) {
          storesRes = storesRes && storesRes.data ? storesRes.data : [];
        }

        // Lấy users
        let usersRes = [];
        try {
          usersRes = await api.get('/api/users');
        } catch (err) {
          usersRes = [];
        }
        if (!Array.isArray(usersRes)) {
          usersRes = usersRes && usersRes.data ? usersRes.data : [];
        }

        if (mounted) {
          const normalized = storesRes.map((s, idx) => {
            const owner = (s.owner && (s.owner.name || s.owner.fullName)) || s.owner_name || s.ownerName || null;
            return {
              key: s.id || s._id || idx,
              id: s.id || s._id || idx,
              name: s.name || s.storeName || s.title || 'No name',
              owner_id: s.owner_id || s.ownerId || (s.owner && (s.owner.id || s.owner._id)) || null,
              owner_name: owner || (s.user && (s.user.name || s.user.fullName)) || s.sellerName || 'Unknown',
              status: (s.status || s.state || 'pending').toLowerCase(),
              total_items: Number(s.total_items || s.items_count || s.product_count || 0),
              createdAt: s.createdAt || s.created_at || s.created || s.createdOn || ''
            };
          });

          setStores(normalized);
          setUsers(usersRes);
        }
      } catch (err) {
        if (err && err.response && err.response.status === 401) {
          notification.error({ message: "Phiên hết hạn", description: "Vui lòng đăng nhập lại" });
          navigate('/login');
        } else {
          notification.error({ message: "Lỗi tải danh sách cửa hàng", description: err.message || String(err) });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, [navigate]);

  // Duyệt cửa hàng (pending -> approved)
  const handleApproveStore = async (id) => {
    const prev = stores.slice();
    const updated = stores.map(store => store.id === id ? { ...store, status: 'approved' } : store);
    setStores(updated);

    try {
      await api.put(`/api/stores/${id}`, { status: 'approved' });
      message.success('Duyệt cửa hàng thành công!');
    } catch (err) {
      setStores(prev);
      if (err && err.response && err.response.status === 401) {
        notification.error({ message: "Phiên hết hạn", description: "Vui lòng đăng nhập lại" });
        navigate('/login');
      } else {
        notification.error({ message: "Lỗi duyệt cửa hàng", description: err.message || String(err) });
      }
    }
  };

  // Từ chối cửa hàng (pending -> banned)
  const handleRejectStore = async () => {
    if (!rejectingStoreId) return;

    setRejectLoading(true);
    const prev = stores.slice();
    const updated = stores.map(store => store.id === rejectingStoreId ? { ...store, status: 'banned' } : store);
    setStores(updated);

    try {
      await api.put(`/api/stores/${rejectingStoreId}`, { 
        status: 'banned',
        reason: rejectReason || 'Không được phép bán'
      });
      message.success('Từ chối cửa hàng thành công!');
      setRejectModalVisible(false);
      setRejectReason('');
      setRejectingStoreId(null);
    } catch (err) {
      setStores(prev);
      if (err && err.response && err.response.status === 401) {
        notification.error({ message: "Phiên hết hạn", description: "Vui lòng đăng nhập lại" });
        navigate('/login');
      } else {
        notification.error({ message: "Lỗi từ chối cửa hàng", description: err.message || String(err) });
      }
    } finally {
      setRejectLoading(false);
    }
  };

  const toggleStoreStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'approved' ? 'banned' : 'approved';
    const prev = stores.slice();
    const updated = stores.map(store => store.id === id ? { ...store, status: newStatus } : store);
    setStores(updated);

    try {
      await api.put(`/api/stores/${id}`, { status: newStatus });
      message.success(`${newStatus === 'approved' ? 'Mở khóa' : 'Khóa'} Store ID: ${id} thành công.`);
    } catch (err) {
      setStores(prev);
      if (err && err.response && err.response.status === 401) {
        notification.error({ message: "Phiên hết hạn", description: "Vui lòng đăng nhập lại" });
        navigate('/login');
      } else {
        notification.error({ message: "Cập nhật trạng thái thất bại", description: err.message || String(err) });
      }
    }
  };

  // Columns
  const storeColumns = [
    { title: "ID", dataIndex: "id", sorter: (a, b) => (a.id || 0) - (b.id || 0), width: 80 },
    { 
      title: "Tên Cửa hàng", 
      dataIndex: "name", 
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/admin/stores/${record.id}`)}
          style={{ padding: 0, color: '#1890ff' }}
        >
          {text}
        </Button>
      )
    },
    {
      title: "Chủ sở hữu",
      dataIndex: "owner_name",
      filters: users.map(u => ({ text: u.name || u.fullName || u.email, value: u.name || u.fullName || u.email })),
      onFilter: (value, record) => (record.owner_name || '').includes(value)
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      filters: [
        { text: 'Được phép bán', value: 'approved' },
        { text: 'Chờ duyệt', value: 'pending' },
        { text: 'Bị khóa', value: 'banned' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag icon={<ShopOutlined />} color={getStatusColor(status)} key={status}>
          {getStatusLabel(status)}
        </Tag>
      )
    },
    { title: "Sản phẩm", dataIndex: "total_items", sorter: (a, b) => (a.total_items || 0) - (b.total_items || 0), width: 100 },
    { title: "Ngày tạo", dataIndex: "createdAt", width: 140 },
    {
      title: "Thao tác",
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {/* Nút duyệt (chỉ hiển thị khi pending) */}
          {record.status === 'pending' && (
            <Popconfirm
              title="Duyệt cửa hàng?"
              description={`Bạn có chắc muốn duyệt ${record.name}?`}
              onConfirm={() => handleApproveStore(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                icon={<CheckCircleOutlined />}
                type="primary"
                size="small"
                style={{ color: '#52c41a', borderColor: '#52c41a' }}
              />
            </Popconfirm>
          )}

          {/* Nút từ chối (chỉ hiển thị khi pending) */}
          {record.status === 'pending' && (
            <Button
              icon={<CloseCircleOutlined />}
              danger
              size="small"
              onClick={() => {
                setRejectingStoreId(record.id);
                setRejectModalVisible(true);
              }}
            />
          )}

          {/* Nút khóa/mở khóa (khi approved hoặc banned) */}
          {(record.status === 'approved' || record.status === 'banned') && (
            <Popconfirm
              title={`Bạn có chắc muốn ${record.status === 'approved' ? 'KHÓA' : 'MỞ KHÓA'} cửa hàng này?`}
              description={`Hành động này sẽ ${record.status === 'approved' ? 'khóa' : 'mở khóa'} Store ${record.name}.`}
              onConfirm={() => toggleStoreStatus(record.id, record.status)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                icon={record.status === 'approved' ? <LockOutlined /> : <UnlockOutlined />}
                danger={record.status === 'approved'}
                type={record.status !== 'approved' ? 'primary' : 'default'}
                size="small"
              />
            </Popconfirm>
          )}
        </Space>
      ),
      width: 180
    },
  ];

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (store.owner_name || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>Quản Lý Cửa Hàng ({stores.length})</Title>}
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm theo Tên Store/Owner..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 320 }}
            />
            <Button type="primary" onClick={() => navigate('/admin/stores/create')}>Thêm Cửa hàng</Button>
          </Space>
        }
        style={{ borderRadius: 8, marginTop: 20 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="Đang tải danh sách cửa hàng..." size="large" />
          </div>
        ) : (
          <Table
            columns={storeColumns}
            dataSource={filteredStores}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      {/* Modal từ chối cửa hàng */}
      <Modal
        title="Từ chối cửa hàng"
        open={rejectModalVisible}
        onOk={handleRejectStore}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
          setRejectingStoreId(null);
        }}
        okText="Từ chối"
        cancelText="Hủy"
        confirmLoading={rejectLoading}
        okButtonProps={{ danger: true }}
      >
        <p>Vui lòng nhập lý do từ chối (tuỳ chọn):</p>
        <textarea
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #d9d9d9',
            fontFamily: 'inherit',
            minHeight: '100px'
          }}
          placeholder="Nhập lý do từ chối (vd: Thông tin không đầy đủ, vi phạm điều khoản...)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default GetAllStores;