import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import App from "./App";
import Login from "./scenes/login/Login";
import { Dashboard, Form, FAQ, Calendar } from "./scenes";
import ManageUsers from "./scenes/users/ManageUsers";
import PODManage from "./scenes/pods/PODManage";
import Stores from "./scenes/stores/ManageStores";
import Payment from "./scenes/payment/Payment";
import Product from "./scenes/product/Product";
import Booking from "./scenes/booking/BookingComponent";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/store" element={<Stores />} />
          <Route path="/booking" element={<Booking/>} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/product" element={<Product />} />
          <Route path="/pod" element={<PODManage />} />
          <Route path="/form" element={<Form />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/faq" element={<FAQ />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
