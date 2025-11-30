import { Button, Form, Input, Card, Typography, notification } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

const StoreRegister = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const onFinish = async (values) => {
    try {
      const res = await axios.post("/api/stores", {
        ...values,
        owner_id: user.id,
      });

      if (res.status === 200) {
        notification.success({
          message: "Store Created",
          description: "Your store has been successfully created!",
        });
        navigate("/Seller"); 
      }
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Create Store Failed",
        description: "Please try again.",
      });
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
        padding: 20,
      }}
    >
      <Card
        style={{
          width: 420,
          padding: 25,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 25 }}>
          Register Your Store
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Store Name"
            name="name"
            rules={[{ required: true, message: "Please input your store name!" }]}
          >
            <Input size="large" placeholder="Enter store name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea size="large" placeholder="Store description" rows={4} />
          </Form.Item>

          <Form.Item
            label="Address"
            name="store_address"
            rules={[{ required: true, message: "Please input store address!" }]}
          >
            <Input size="large" placeholder="Enter store address" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="store_phone"
            rules={[{ required: true, message: "Please input store phone!" }]}
          >
            <Input size="large" placeholder="Enter store phone" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: "100%", marginTop: 10, borderRadius: 6 }}
          >
            Create Store
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default StoreRegister;
