

import { Button, Checkbox, Form, Input } from 'antd'; 
import {LoginApi} from '../unti/api';
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom'; 
import 'antd/dist/reset.css'; 

const LoginPage = () => {
    const navigate = useNavigate(); 
    const onFinish = async (values) => {
    try {
        //console.log("values >>>", values); // phải ra {name, password}
        const res = await LoginApi(values.name, values.password);
        console.log("Login response >>>", res);

        if(res?.access_token){

            localStorage.setItem("access_token", res.access_token);
            console.log("Token saved!");
        }


        localStorage.setItem("user_info", JSON.stringify(res.user));

        notification.success({ message: "Login Success" ,description: `Welcome ${res.user.name}`,duration: 2 });
        setTimeout(() => {
          navigate('/');
        }, 100);
      } catch (err) {
            console.error(err);
            notification.error({ message: "Login Failed" });
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
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                > 
                    <Input type="password" />
                </Form.Item>


                <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                    Login
                </Button>
                </Form.Item>
            </Form>
        </div>

    )


}




export default LoginPage;


