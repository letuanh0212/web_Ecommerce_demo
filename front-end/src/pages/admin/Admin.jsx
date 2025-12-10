import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../component/Admin_Sidebar";

export default function AdminLayout() {
  return (
    // Khung tổng
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      
      {/* SIDEBAR trái */}
      <div
        style={{
          width: "256px",
          flexShrink: 0,
          borderRight: "1px solid #e8e8e8",
          backgroundColor: "#f1f2f3ff",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <AdminSidebar />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        <div
          style={{
            flex: 1,
            padding: "24px",
            backgroundColor: "#f9f9fdff",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </div>

      </div>
    </div>
  );
}
