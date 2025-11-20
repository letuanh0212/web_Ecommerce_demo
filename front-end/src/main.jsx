import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import HomePage from './pages/Home.jsx';
import UserPage from './pages/User.jsx';
import RegisterPage from './pages/Register.jsx';
import LoginPage from './pages/Login.jsx';

import 'antd/dist/reset.css'; // Import CSS AntD

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '', element: <HomePage /> },       // Home
      { path: 'user', element: <UserPage /> },   // User
      { path: 'register', element: <RegisterPage /> } // Register
    ]
  },
  { path: '/login', element: <LoginPage /> }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
