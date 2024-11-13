import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./scenes/login/Login";
import { Dashboard, } from "./scenes";
import ManageUsers from "./scenes/users/ManageUsers";
import PODManage from "./scenes/pods/PODManage";
import Stores from "./scenes/stores/ManageStores";
import Payment from "./scenes/payment/Payment";
import Product from "./scenes/product/Product";
import Booking from "./scenes/booking/BookingComponent";
import PodForm from "./scenes/form/PodForm";
import BookingDetail from "./scenes/booking/BookingDetail";
import Welcome from "./scenes/welcome/Welcome";
import StoreForm from "./scenes/form/StoreForm";
import StoreDetail from "./scenes/stores/StoreDetail";
import GenerateSlot from "./scenes/form/GenerateSlot";
import Slots from "./scenes/slots/ManageSlots";
import UserForm from "./scenes/form/UserForm";
import CreateStorePriceForm from "./scenes/form/StorePriceForm";
import ProtectedRoute from './ProtectedRoute';

import Unauthorized from './scenes/unauthorized/Unauthorized';
import PrivateRoute from "./PrivateRoute";
import CreateProduct from "./scenes/form/CreateProduct";

import StoreRevenue from "./scenes/chart/StoreRevenue";
import PODRevenueChart from "./scenes/chart/PODRevenueChart";
import RefundAnalysisChart from "./scenes/chart/RefundAnalysisChart";
import Rules from './scenes/rules/Rules';
import TotalRevenueChart from "./scenes/chart/TotalRevenueChart";
import { registerNavigationCallback } from './utils/auth';



function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    registerNavigationCallback((path) => navigate(path, { replace: true }));
  }, [navigate]);

  return (

      <Routes>
        
        <Route path="/" element={<Login />} />

        <Route path="/web" element={<Welcome />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="userform" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
          <Route path="store" element={<Stores />} />
          <Route path="store/:id" element={<StoreDetail/>} />
          <Route path="storeform" element={<PrivateRoute><StoreForm/></PrivateRoute>} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="booking" element={<Booking />} />
          <Route path="booking/:id" element={<BookingDetail />} />
          <Route path="payment" element={<Payment />} />
          <Route path="product" element={<Product />} />
          <Route path="pod" element={<PODManage />} />
          <Route path="pod/:pod_id" element={<Slots/>} />
          <Route path="pod/:pod_id/slot" element={<GenerateSlot/>} />
          <Route path="stores/:id/storeprice-form" element={<PrivateRoute><CreateStorePriceForm/></PrivateRoute>}/>
          <Route path="productform" element={<ProtectedRoute><CreateProduct/></ProtectedRoute>} />
          <Route 
          path="podform"  
          element={
            <ProtectedRoute>
              <PodForm />
            </ProtectedRoute>
          } 
          />
          <Route path="line" element={<TotalRevenueChart />} />
       
          <Route path="pod-revenue" element={<PODRevenueChart/>} />
          <Route path="store-revenue" element={<StoreRevenue />} />
          <Route path="refund-analysis" element={<RefundAnalysisChart />} />
          <Route path="rules" element={<Rules />} />
          
     
        </Route>
    
      </Routes>
        
  );
}

export default App;