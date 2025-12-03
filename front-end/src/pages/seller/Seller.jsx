import React from "react";
import { Outlet } from "react-router-dom";
import SellerHeader from "../../component/header_seller.jsx";
import NavbarSeller from "../../component/Navbar_seller.jsx";

export default function SellerLayout() {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: "0 0 256px" }}> {/* Sidebar */}
        <NavbarSeller />
      </div>
      <div style={{ flex: 1 }}>
        <SellerHeader />
        <div style={{ padding: "20px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
