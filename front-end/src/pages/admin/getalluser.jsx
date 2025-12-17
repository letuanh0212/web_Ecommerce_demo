import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, PlusOutlined } from '@ant-design/icons';
import { Input, Modal, Form, message, Tabs } from 'antd';
import adminApi from "../../unti/api_admin";

export default function UserDataGridDemo() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('list');
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const [usersResp, sellersResp] = await Promise.all([adminApi.getUsers(), adminApi.getSellers()]);
        const usersArr = Array.isArray(usersResp) ? usersResp : [];
        const sellersArr = Array.isArray(sellersResp) ? sellersResp : [];

        const mappedUsers = usersArr.map(u => ({
          id: u.id || u.ID || u.user_id || `u_${Math.random()}`,
          name: u.name,
          email: u.email,
          phone: u.phone,
          address: u.address,
          role: u.role || 'user',
          createdAt: u.createdAt || u.created_at || u.registeredAt || '-',
          is_active: typeof u.is_active !== 'undefined' ? u.is_active : (u.isActive || true),
        }));

        const mappedSellers = sellersArr.map(s => ({
          id: s.id || s._id || s.ID || `s_${Math.random()}`,
          name: s.name || s.storeName || s.username || 'Seller',
          email: s.email || '-',
          phone: s.phone || '',
          address: s.address || s.location || '',
          role: 'seller',
          createdAt: s.createdAt || s.created_at || s.registeredAt || '-',
          is_active: typeof s.is_active !== 'undefined' ? s.is_active : (s.isActive || true),
        }));

        // merge users + sellers, sort by createdAt desc
        const combined = [...mappedUsers, ...mappedSellers].sort((a, b) => {
          const da = new Date(a.createdAt || 0).getTime();
          const db = new Date(b.createdAt || 0).getTime();
          return db - da;
        });

        setRows(combined);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleAdd = () => {
      setEditingUser(null);
      form.resetFields();
      setActiveTab('form');
    };

    const handleEdit = (row) => {
      setEditingUser(row);
      form.setFieldsValue({ name: row.name, email: row.email, phone: row.phone, address: row.address, role: row.role });
      setActiveTab('form');
    };

    const submitEdit = async () => {
      try {
        const values = await form.validateFields();
        if (editingUser) {
          await adminApi.updateUser(editingUser.id, values);
          setRows(prev => prev.map(r => r.id === editingUser.id ? { ...r, ...values } : r));
          message.success('User updated');
        } else {
          // create
          const payload = { ...values };
          // ensure password provided when creating
          if (!payload.password) {
            message.error('Password is required for new users');
            return;
          }
          const resp = await adminApi.createUser(payload);
          if (resp && resp.user) {
            const u = resp.user;
            const mapped = {
              id: u.id || u.ID || u.user_id || `u_${Math.random()}`,
              name: u.name,
              email: u.email,
              phone: u.phone,
              address: u.address,
              role: u.role,
              createdAt: u.createdAt || u.created_at || '-',
              is_active: typeof u.is_active !== 'undefined' ? u.is_active : true,
            };
            setRows(prev => [mapped, ...prev]);
          } else {
            await fetchUsers();
          }
          message.success('User created');
        }
        setEditingUser(null);
        form.resetFields();
        setActiveTab('list');
      } catch (err) {
        console.error(err);
        message.error('Save failed: ' + (err.message || err));
      }
    };

    const handleDelete = async (id) => {
      Modal.confirm({
        title: 'Delete user',
        content: 'Are you sure you want to delete this user?',
        okText: 'Delete',
        okType: 'danger',
        onOk: async () => {
          try {
            await adminApi.deleteUser(id);
            setRows(prev => prev.filter(r => r.id !== id));
            message.success('User deleted');
          } catch (err) {
            console.error(err);
            message.error('Delete failed: ' + (err.message || err));
          }
        }
      });
    };

    const handleToggleLock = async (row) => {
      const willLock = row.is_active !== false; // if active -> lock, else unlock
      try {
        await adminApi.lockUser(row.id, willLock);
        fetchUsers();
        alert(willLock ? 'User locked' : 'User unlocked');
      } catch (err) {
        console.error(err);
        alert('Operation failed: ' + (err.message || err));
      }
    };

    const userColumns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 240 },
        { field: 'phone', headerName: 'Phone', width: 140 },
        { field: 'address', headerName: 'Address', width: 180 },
        { field: 'role', headerName: 'Role', width: 110 },
        { field: 'createdAt', headerName: 'Created', width: 160 },
        {
          field: 'actions', headerName: 'Actions', width: 220, renderCell: (params) => {
            const r = params.row;
            return (
              <div style={{ display: 'flex', gap: 8 }}>
                  <IconButton size="small" onClick={() => handleEdit(r)} title="Edit"><EditOutlined /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(r.id)} title="Delete"><DeleteOutlined /></IconButton>
                  <IconButton size="small" onClick={() => handleToggleLock(r)} title={r.is_active ? 'Lock' : 'Unlock'}>
                    {r.is_active ? <LockOutlined /> : <UnlockOutlined />}
                  </IconButton>
              </div>
            );
          }
        }
    ];

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k)}>
              <Tabs.TabPane tab="Danh sách" key="list">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Input.Search placeholder="Search name, email or role" style={{ width: 360 }} allowClear onSearch={(v) => setSearchQuery(v)} onChange={(e) => setSearchQuery(e.target.value)} />
                  <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleAdd}>Add user</Button>
                </div>
                <DataGrid
                    rows={rows.filter(r => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (r.name && r.name.toLowerCase().includes(q)) || (r.email && r.email.toLowerCase().includes(q)) || (r.role && r.role.toLowerCase().includes(q));
                    })}
                    columns={userColumns}
                    pageSizeOptions={[5]}
                    loading={loading}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    checkboxSelection
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={editingUser ? 'Chỉnh sửa' : 'Thêm người dùng'} key="form">
                <div style={{ maxWidth: 720, marginTop: 8 }}>
                  <Button onClick={() => { setActiveTab('list'); setEditingUser(null); form.resetFields(); }} style={{ marginBottom: 12 }}>Back to list</Button>
                  <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                      <Input />
                    </Form.Item>
                    {!editingUser && (
                      <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                        <Input.Password />
                      </Form.Item>
                    )}
                    <Form.Item name="phone" label="Phone">
                      <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                      <Input />
                    </Form.Item>
                    <Form.Item name="role" label="Role">
                      <Input />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button type="primary" onClick={submitEdit}>{editingUser ? 'Save changes' : 'Create user'}</Button>
                      <Button onClick={() => { setActiveTab('list'); setEditingUser(null); form.resetFields(); }}>Cancel</Button>
                    </div>
                  </Form>
                </div>
              </Tabs.TabPane>
            </Tabs>
        </Box>
    );
}
