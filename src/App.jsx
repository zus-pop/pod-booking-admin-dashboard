import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./scenes/login/Login";
import { Dashboard, FAQ, Calendar } from "./scenes";
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

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/web" element={<Welcome />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="userform" element={<UserForm />} />
          <Route path="store" element={<Stores />} />
          <Route path="store/:id" element={<StoreDetail/>} />
          <Route path="storeform" element={<StoreForm/>} />
          <Route path="booking" element={<Booking />} />
          <Route path="booking/:id" element={<BookingDetail />} />
          <Route path="payment" element={<Payment />} />
          <Route path="product" element={<Product />} />
          <Route path="pod" element={<PODManage />} />
          <Route path="pod/:pod_id" element={<Slots/>} />
          <Route path="pod/:pod_id/slot" element={<GenerateSlot/>} />
          <Route path="stores/:id/pod-type/:typeId/storeprice-form" element={<CreateStorePriceForm/>}/>
          <Route path="podform" element={<PodForm />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="faq" element={<FAQ />} />
        </Route>
      </Routes>
  );
}

export default App;