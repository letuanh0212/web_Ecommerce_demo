import React from "react";
import { Row, Col, Card, Typography, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;
const { Title } = Typography;

const HomeProducts = ({ products, onOpenModal }) => {
  const navigate = useNavigate();

  // Hàm xử lý URL ảnh an toàn
  const getImageUrl = (product) => {
    // 1. Lấy đường dẫn ảnh từ các nguồn có thể
    let imgPath =
      product?.image ||
      product?.ItemImages?.[0]?.image ||
      product?.variants?.[0]?.image;

    // 2. Nếu không có ảnh -> Trả về ảnh placeholder
    if (!imgPath) {
      return "https://placehold.co/600x400?text=No+Image";
    }

    // 3. Nếu là link online (cloudinary, firebase...) -> Giữ nguyên
    if (imgPath.startsWith("http")) {
      return imgPath;
    }

    // 4. Xử lý đường dẫn Local:
    // - Thay dấu gạch chéo ngược '\' thành '/' (Lỗi hay gặp trên Windows)
    // - Xóa chữ 'public' ở đầu nếu backend đã map folder này rồi (Tùy cấu hình BE)
    // - Đảm bảo không bị 2 dấu gạch chéo '//'
    let cleanPath = imgPath.replace(/\\/g, "/").replace(/^\/+/, ""); 
    
    // **QUAN TRỌNG**: Server của bạn chạy PORT 8080 (theo file server.js), không phải 5000
    const BACKEND_URL = "http://localhost:8080"; 

    return `${BACKEND_URL}/${cleanPath}`;
  };

  return (
    <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
      <Title level={3}>Tất cả sản phẩm</Title>

      <Row gutter={[16, 16]}>
        {products && products.length > 0 ? (
          products.map((product) => {
            const imgSrc = getImageUrl(product);

            return (
              <Col
                xs={24} sm={12} md={8} lg={6} xl={4}
                key={product.id || product._id}
              >
                <Card
                  hoverable
                  style={{ cursor: "pointer", height: "100%" }}
                  onClick={() => navigate(`/product/${product.id || product._id}`)}
                  cover={
                    <div style={{ height: "200px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                          src={imgSrc}
                          alt={product.name}
                          onError={(e) => {
                              // Fallback nếu ảnh lỗi
                              e.target.onerror = null; 
                              e.target.src = "https://placehold.co/600x400?text=Error+Loading";
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover", // Giữ tỉ lệ ảnh đẹp
                          }}
                        />
                    </div>
                  }
                >
                  <Meta 
                    title={product.name} 
                    description={<span style={{ color: "red", fontWeight: "bold" }}>
                        {Number(product.price).toLocaleString('vi-VN')}₫
                    </span>} 
                  />

                  <div style={{ marginTop: 10 }}>
                    <Button
                      type="primary"
                      block
                      icon={<ShoppingCartOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenModal(product);
                      }}
                    >
                      Thêm vào giỏ
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col span={24}>
            <div style={{ textAlign: "center", padding: "20px" }}>Chưa có sản phẩm nào</div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default HomeProducts;