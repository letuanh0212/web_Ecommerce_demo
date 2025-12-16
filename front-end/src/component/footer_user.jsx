import React from "react";
import { Row, Col, Typography, Divider } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Footer = () => {
  return (
    <div
      style={{
        background: "#111",
        color: "#fff",
        marginTop: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 15px 20px",
        }}
      >
        <Row gutter={[24, 24]}>
          {/* LOGO + DESCRIPTION */}
          <Col xs={24} md={8}>
            <Title level={4} style={{ color: "#fff" }}>
              🛒 My Shop
            </Title>
            <Text style={{ color: "#bbb" }}>
              Nền tảng mua sắm trực tuyến uy tín, đa dạng sản phẩm, 
              giao hàng nhanh chóng và hỗ trợ tận tâm.
            </Text>
          </Col>

          {/* LINKS */}
          <Col xs={24} md={8}>
            <Title level={5} style={{ color: "#fff" }}>
              Liên kết nhanh
            </Title>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Text style={{ color: "#bbb", cursor: "pointer" }}>Trang chủ</Text>
              <Text style={{ color: "#bbb", cursor: "pointer" }}>Sản phẩm</Text>
              <Text style={{ color: "#bbb", cursor: "pointer" }}>Danh mục</Text>
              <Text style={{ color: "#bbb", cursor: "pointer" }}>Giỏ hàng</Text>
            </div>
          </Col>

          {/* CONTACT */}
          <Col xs={24} md={8}>
            <Title level={5} style={{ color: "#fff" }}>
              Liên hệ
            </Title>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Text style={{ color: "#bbb" }}>
                <MailOutlined /> support@ecommerce.com
              </Text>
              <Text style={{ color: "#bbb" }}>
                <PhoneOutlined /> 0123 456 789
              </Text>

              <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
                <FacebookOutlined style={{ fontSize: 20, color: "#bbb" }} />
                <InstagramOutlined style={{ fontSize: 20, color: "#bbb" }} />
                <YoutubeOutlined style={{ fontSize: 20, color: "#bbb" }} />
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: "#333", margin: "30px 0 15px" }} />

        {/* COPYRIGHT */}
        <div style={{ textAlign: "center" }}>
          <Text style={{ color: "#777" }}>
            © {new Date().getFullYear()} My Ecommerce. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Footer;
