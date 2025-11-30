import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import HomePage from './pages/user/Home.jsx';
import UserPage from './pages/user/User.jsx';
import RegisterPage from './pages/user/Register.jsx';
import LoginPage from './pages/user/Login.jsx';
import Admin from './pages/admin/Admin.jsx';
import Seller from './pages/seller/Seller.jsx';
import GetAllUsers from './pages/admin/getalluser.jsx';
import GetallSellers from './pages/admin/getallseller.jsx';
import RegisterStore from './pages/seller/StoreRegister.jsx';
import StorePage from './pages/seller/StorePage.jsx'; 

import 'antd/dist/reset.css'; 


const router = createBrowserRouter([

  {
    path: '/',
    element: <App />,
    children: [
      { path: '', element: <HomePage /> },       
      { path: 'user', element: <UserPage /> },   
      

    ]
  },

  
  {
    path: '/Admin',
    element: <Admin />,  
    children: [
      { path: 'users', element: <GetAllUsers /> },
      { path: 'sellers', element: <GetallSellers /> },
      
    ]
  },


  {
    path: '/Seller',
    element: <Seller />,
    children: [
      { path: 'store' , element: <StorePage /> },
      {path: 'registerStore', element: <RegisterStore /> }
  
    ]
  },
  { path: 'register', element: <RegisterPage /> },
  { path: '/login', element: <LoginPage /> }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
