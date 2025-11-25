import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import HomePage from './pages/Home.jsx';
import UserPage from './pages/User.jsx';
import RegisterPage from './pages/Register.jsx';
import LoginPage from './pages/Login.jsx';

import AdminPage from './pages/admin-dashboard.jsx';
import StorePage from './pages/seller-store.jsx';

import 'antd/dist/reset.css'; 

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '', element: <HomePage /> },       
      { path: 'user', element: <UserPage /> },   
      { path: 'register', element: <RegisterPage /> } ,
      { path: '/admin-dashboard', element: <AdminPage /> },
        { path: '/seller-store', element: <StorePage /> }
    ]
  },

  { path: '/login', element: <LoginPage /> }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
