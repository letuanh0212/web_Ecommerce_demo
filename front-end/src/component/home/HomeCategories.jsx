// src/pages/user/component/HomeCategories.jsx
import React from "react";
import { Row, Col, Typography } from "antd";
const { Title } = Typography;

import imgMap from "../../unti/imgMap";

// Category + keywords
const displayCategories = [
  {
    key: "bags",
    label: "Túi xách",
    keywords: ["bag", "handbag", "backpack", "túi", "ba lô", "balo"]
  },
  {
    key: "beauty",
    label: "Làm đẹp",
    keywords: ["beauty", "makeup", "skincare", "son", "kem dưỡng", "trang điểm"]
  },
  {
    key: "books",
    label: "Sách",
    keywords: ["book", "novel", "reading", "sách", "truyện", "tiểu thuyết"]
  },
  {
    key: "electronics",
    label: "Điện tử",
    keywords: [
      "electronics", "phone", "laptop", "pc", "điện thoại", "máy tính", "tai nghe",
      "tivi", "loa", "tablet", "máy tính bảng"
    ]
  },
  {
    key: "fashion",
    label: "Thời trang",
    keywords: ["fashion", "clothes", "dress", "shirt", "quần", "áo", "váy", "thời trang"]
  },
  {
    key: "health",
    label: "Sức khỏe",
    keywords: ["health", "vitamin", "supplement", "sức khỏe", "thực phẩm chức năng"]
  },
  {
    key: "home",
    label: "Nhà cửa",
    keywords: ["home", "furniture", "decor", "nhà cửa", "nội thất", "trang trí"]
  },
  {
    key: "jewelry",
    label: "Trang sức",
    keywords: ["jewelry", "ring", "necklace", "vòng", "nhẫn", "dây chuyền"]
  },
  {
    key: "kitchen",
    label: "Nhà bếp",
    keywords: ["kitchen", "cook", "pan", "nhà bếp", "nồi", "chảo", "dao", "dụng cụ bếp"]
  },
  {
    key: "shoes",
    label: "Giày dép",
    keywords: [
      "shoe", "sneaker", "boot",
      "giày", "dép", "giày thể thao", "giày sneaker", "ủng"
    ]
  },
  {
    key: "sports",
    label: "Thể thao",
    keywords: ["sport", "gym", "fitness", "thể thao", "tập gym", "dụng cụ thể thao"]
  },
  {
    key: "watches",
    label: "Đồng hồ",
    keywords: ["watch", "timepiece", "đồng hồ"]
  }
];


export default function HomeCategories({ products, onFilter }) {

  /** 🟦 FILTER THEO KEYWORDS */
  const handleFilter = (cateKey) => {
    if (!products || products.length === 0) return;

    const category = displayCategories.find((c) => c.key === cateKey);
    if (!category) return;

    const filtered = products.filter((item) =>
      category.keywords.some((kw) => {
        const key = kw.toLowerCase();
        return (
          item.name?.toLowerCase().includes(key) ||
          item.description?.toLowerCase().includes(key)
        );
      })
    );

    onFilter(filtered);
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: "20px" }}>
        Categories
      </Title>

      <Row gutter={[16, 16]}>
        {displayCategories.map((item) => (
          <Col key={item.key} xs={8} sm={6} md={4} lg={3}>
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "10px",
                textAlign: "center",
                cursor: "pointer",
                transition: "0.3s",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
              onClick={() => handleFilter(item.key)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <img
                src={imgMap[item.key]}
                alt={item.label}
                style={{
                  width: "100%",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  marginBottom: "8px",
                }}
              />
              <div style={{ fontWeight: "600" }}>{item.label}</div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}