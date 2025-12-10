// src/pages/user/components/HomeRecommended.jsx
import React, { useRef, useState, useEffect } from "react";
import { Card, Spin, Button, Typography } from "antd";
import { ShoppingCartOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

const { Meta } = Card;
const { Title, Text } = Typography;

const CARD_WIDTH = 260;
const CARD_HEIGHT = 360;
const COVER_HEIGHT = 160;
const DESC_HEIGHT = 48;

const cardWrapperStyle = {
  minWidth: CARD_WIDTH,
  maxWidth: CARD_WIDTH,
  flex: `0 0 ${CARD_WIDTH}px`,
  height: CARD_HEIGHT,
  display: "flex",
};

const coverImgStyle = {
  height: COVER_HEIGHT,
  width: "100%",
  objectFit: "cover",
  display: "block",
};

const cardBodyStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: `calc(${CARD_HEIGHT}px - ${COVER_HEIGHT}px)`,
  padding: "12px 16px",
  boxSizing: "border-box",
};

const descStyle = {
  height: DESC_HEIGHT,
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  fontSize: 13,
  color: "#8c8c8c",
  marginTop: 6,
};

const HomeRecommended = ({ recommended, loading, onOpenModal }) => {
  const containerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // ⭐ HÀM LẤY ẢNH CHUẨN
  const getImage = (item) => {
    if (!item) return "https://placehold.co/300x200";

    if (item.image) {
      return item.image.startsWith("http")
        ? item.image
        : `http://localhost:5000/uploads/items/${item.image}`;
    }

    if (item.itemImage) {
      return item.itemImage.startsWith("http")
        ? item.itemImage
        : `http://localhost:5000/uploads/items/${item.itemImage}`;
    }

    if (item.ItemImages?.length > 0) {
      const img = item.ItemImages[0].image;
      return img.startsWith("http")
        ? img
        : `http://localhost:5000/uploads/items/${img}`;
    }

    return "https://placehold.co/300x200";
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setCanPrev(el.scrollLeft > 0);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [recommended]);

  const scrollByPage = (dir = 1) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: Math.round(el.clientWidth * 0.9) * dir, behavior: "smooth" });
  };

  return (
    <div style={{ marginBottom: 30, background: "#fff", padding: 20, borderRadius: 8, position: "relative" }}>
      <Title level={3}>Sản Phẩm HOT</Title>

      {loading ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin size="large" />
        </div>
      ) : recommended?.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button icon={<LeftOutlined />} onClick={() => scrollByPage(-1)} disabled={!canPrev} />

          <div
            ref={containerRef}
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              overflowY: "hidden",
              padding: "8px 4px 12px 4px",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              flex: 1,
            }}
          >
            {recommended.map((item) => (
              <div key={item.id} style={cardWrapperStyle}>
                <Card
                  hoverable
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    padding: 0,
                    boxSizing: "border-box",
                    height: "100%",
                  }}
                  cover={
                    <div style={{ width: "100%", height: COVER_HEIGHT, overflow: "hidden" }}>
                      <img
                        src={getImage(item)}
                        alt={item.name}
                        style={coverImgStyle}
                      />
                    </div>
                  }
                  bodyStyle={{ padding: 0 }}
                >
                  <div style={cardBodyStyle}>
                    <div>
                      <Meta
                        title={<div style={{ fontSize: 15 }}>{item.name}</div>}
                        description={
                          <>
                            <div style={{ marginTop: 6 }}>
                              <Text strong style={{ fontSize: 16 }}>
                                {Number(item.price || 0).toLocaleString()}₫
                              </Text>
                            </div>

                            <div style={descStyle} title={item.description}>
                              {item.description}
                            </div>
                          </>
                        }
                      />
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <Button
                        type="primary"
                        block
                        icon={<ShoppingCartOutlined />}
                        onClick={() => onOpenModal(item)}
                      >
                        Thêm vào giỏ
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <Button icon={<RightOutlined />} onClick={() => scrollByPage(1)} disabled={!canNext} />
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "#666" }}>Không có gợi ý</div>
      )}
    </div>
  );
};

export default HomeRecommended;
