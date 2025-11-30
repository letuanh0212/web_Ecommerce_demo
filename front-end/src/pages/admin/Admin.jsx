import { Outlet } from "react-router-dom";
import AdminSidebar from "../../component/Admin_Sidebar.jsx";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}
