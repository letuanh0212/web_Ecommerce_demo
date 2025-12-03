import React, { useEffect, useState, useRef } from "react"; // 1. Import useRef
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Image, Button, message, Skeleton, Divider } from "antd";
import { LikeOutlined, EyeOutlined, CalendarOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { getArticleDetailApi, likeArticleApi } from "../../unti/api";

const { Title, Paragraph } = Typography;

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);

  // 2. Tạo biến cờ hiệu để chặn gọi 2 lần
  const hasFetched = useRef(false);

  useEffect(() => {
    // 3. Kiểm tra: Nếu đã gọi rồi thì dừng lại ngay
    if (hasFetched.current) return;
    hasFetched.current = true; // Đánh dấu là đã gọi

    const fetchDetail = async () => {
      try {
        const res = await getArticleDetailApi(id);
        setArticle(res);
        setLikeCount(res.likes);
      } catch (err) {
        message.error("Không tìm thấy bài viết");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        message.warning("Vui lòng đăng nhập để Like bài viết!");
        navigate("/login");
        return;
    }

    try {
      await likeArticleApi(id);
      setLikeCount(prev => prev + 1);
      message.success("Đã thích bài viết!");
    } catch (err) {
      // Hiển thị lỗi từ backend (ví dụ: Bạn đã thích rồi)
      message.error(err.response?.data?.message || "Lỗi kết nối");
    }
  };

  if (loading) return <div style={{ padding: 50 }}><Skeleton active /></div>;
  if (!article) return <div>Bài viết không tồn tại</div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 20px 50px" }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/blog")}>
        Quay lại
      </Button>

      <div style={{ background: "#fff", padding: 40, borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <Title level={1}>{article.title}</Title>
        
        <div style={{ display: "flex", gap: 20, color: "#888", marginBottom: 20 }}>
            <span><CalendarOutlined /> {new Date(article.createdAt).toLocaleDateString()}</span>
            <span><EyeOutlined /> {article.views} lượt xem</span>
        </div>

        {article.image && (
            <Image 
                src={article.image} 
                width="100%" 
                style={{ borderRadius: 8, marginBottom: 30, maxHeight: 400, objectFit: 'cover' }} 
            />
        )}

        <Typography>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {article.description}
            </Paragraph>
        </Typography>

        <Divider />

        <div style={{ textAlign: "center" }}>
            <Button 
                type="primary" 
                shape="round" 
                icon={<LikeOutlined />} 
                size="large"
                onClick={handleLike}
            >
                Thích bài viết ({likeCount})
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;