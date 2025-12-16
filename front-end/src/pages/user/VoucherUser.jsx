import React, { useEffect, useState } from "react";
import { Table, Button, message, Tag, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "../../unti/axios.cusomize";

const { Title } = Typography;

const VoucherUser = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      // Giả sử API lấy voucher available cho user
      const res = await axios.get("/api/vouchers/user");
      setVouchers(res.data || []);
    } catch (err) {
      message.error("Lỗi tải voucher");
    } finally {
      setLoading(false);
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
      title: "Còn lại",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Hết hạn",
      dataIndex: "end_date",
      key: "end_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Voucher của tôi</Title>
      <Card>
        <Table
          columns={columns}
          dataSource={vouchers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default VoucherUser;