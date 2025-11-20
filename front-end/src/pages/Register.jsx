


import { Button, Checkbox, Form, Input } from 'antd'; 
import {createUserApi} from '../unti/api';
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom'; 

const RegisterPage = () => {
    const navigate = useNavigate(); 
    const onFinish = async (values) => {
        const { name,email, phone, address, password } = values;
        const register = await createUserApi(name, email,phone ,address, password)
        if(register){
            notification.success({ message: "Create User", description: "Success" });
            navigate("/login");
        }else{
            notification.error({ message: "Cannot create User", description: "Error" });
        }
    };

    return (
        <div    >     
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout='vertical'
                autoComplete="off"
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input your Name!' }]}
                >
                <Input />
                </Form.Item>


                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please input your Gmail!' }]}
                >
                <Input />
                </Form.Item>

                <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[{ required: true, message: 'Please input your phone!' }]}
                >
                <Input />
                </Form.Item>

                <Form.Item
                    label="Address"
                    name="address"
                    rules={[{ required: true, message: 'Please input your Address!' }]}
                >
                <Input />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                <Input />
                </Form.Item>

                <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
                </Form.Item>
            </Form>
        </div>
    )

}


export default RegisterPage;