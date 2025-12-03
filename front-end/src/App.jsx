import { useEffect } from "react";
import axios  from "./unti/axios.cusomize.js"
import Header1 from './component/header.jsx';  
import { Outlet } from "react-router-dom";
import { Footer } from "antd/es/layout/layout.js";
function App() {

    useEffect(() => {
    const fetchHello = async () => {
      try {  
        const res = await axios.get(`/v1/api`);
        console.log(">>> ", import.meta.env.vite_api);
        console.log("check >>>>>>>>>>>>> ", res);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchHello();
  }, [] );
  return (
      <>
        <Header1></Header1>
        
        <Outlet/>
        <Footer style={{ textAlign: 'center' }}>E-Commerce ©2024 Created by team7</Footer>
      </>
    )
}

export default App

