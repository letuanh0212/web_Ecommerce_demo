import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin, Avatar } from "antd";
import { EyeOutlined, LikeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAllArticlesApi } from "../../unti/api";

const { Meta } = Card;
const { Title } = Typography;

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await getAllArticlesApi();
      setArticles(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px 50px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>Tin tức & Khuyến mãi</Title>
      
      {loading ? <div style={{textAlign: 'center'}}><Spin size="large" /></div> : (
        <Row gutter={[24, 24]}>
          {articles.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                cover={
                  <img 
                    alt="example" 
                    src={item.image || "https://via.placeholder.com/300x200"} 
                    style={{ height: 200, objectFit: "cover" }}
                  />
                }
                onClick={() => navigate(`/blog/${item.id}`)}
                actions={[
                  <span key="view"><EyeOutlined /> {item.views}</span>,
                  <span key="like"><LikeOutlined /> {item.likes}</span>,
                ]}
              >
                <Meta
                  title={item.title}
                  description={
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {item.description}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default BlogPage;