import { useEffect } from "react";
import axios  from "./unti/axios.cusomize.js"
import Header from "./component/Header.jsx";  
import { Outlet } from "react-router-dom";
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
        <Header></Header>
        <Outlet/>
      </>
    )
}

export default App

