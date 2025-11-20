import { useEffect } from "react";
import axios  from "./unti/axios.cusomize.js"
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
    <h1>Welcome to my Website</h1>
  )
}

export default App

