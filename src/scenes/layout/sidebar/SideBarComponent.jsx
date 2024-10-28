/* eslint-disable react/prop-types */
import { Avatar, Box, IconButton, Typography, useTheme,  Button} from "@mui/material";
import { useContext, useState } from "react";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import {
  CalendarTodayOutlined,
  ContactsOutlined,
  DashboardOutlined,
  HelpOutlineOutlined,
  MenuOutlined,
  PeopleAltOutlined,
  PersonOutlined,
  InventoryOutlined,
} from "@mui/icons-material";
import StoreIcon from "@mui/icons-material/Store";
import PaymentIcon from "@mui/icons-material/Payment";
import ChecklistIcon from "@mui/icons-material/Checklist";
import avatar from "../../../assets/images/avatar.png";
import logo from "../../../assets/images/logo.png";
import Item from "./Item";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToggledContext } from "../../welcome/Welcome";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const notify = () => {
  const toastId = toast.error(
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div>Session Expired! Please login again</div>
      <Button 
        onClick={() => toast.dismiss(toastId)} 
        variant="contained" 
        color="primary" 
        style={{ marginTop: '10px' }}
      >
        OK
      </Button>
    </div>,
    {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
    }
  );
};
const API_URL = import.meta.env.VITE_API_URL
const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [userName, setUserName] = useState(""); // Default name
  const [roleName, setRole] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }
      try {
        const response = await fetch(
          `${API_URL}/api/v1/auth/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          setUserName(data.user_name);
          setRole(data.role.role_name);
        } else if (response.status === 401) {
          console.error("Unauthorized access. Redirecting to login.");
          localStorage.removeItem("token");
          navigate("/", { replace: true });
        } else if (response.status === 403) {
          console.error("Token expired. Please login again.");
          notify();
          localStorage.removeItem("token");
          navigate("/", { replace: true });
        } else {
          console.error("Failed to fetch user profile");
          // Có thể thêm xử lý lỗi khác ở đây nếu cần
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Xử lý lỗi mạng hoặc lỗi không mong đợi
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
      rootStyles={{
        border: 0,
        height: "100%",
      }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu
        menuItemStyles={{
          button: { ":hover": { background: "transparent" } },
        }}
      >
        <MenuItem
          rootStyles={{
            margin: "10px 0 20px 0",
            color: colors.gray[100],
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {!collapsed && (
              <Box
                display="flex"
                alignItems="center"
                gap="12px"
                sx={{ transition: ".3s ease" }}
              >
                <img
                  style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                  src={logo}
                  alt="Argon"
                />
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  textTransform="capitalize"
                  color={colors.greenAccent[500]}
                >
                  POD
                </Typography>
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>
      {!collapsed && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            mb: "25px",
          }}
        >
          <Avatar
            alt="avatar"
            src={avatar}
            sx={{ width: "100px", height: "100px" }}
          />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" fontWeight="bold" color={colors.gray[100]}>
              {userName}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="500"
              color={colors.greenAccent[500]}
            >
              {roleName} of POD System
            </Typography>
          </Box>
        </Box>
      )}

      <Box mb={5} pl={collapsed ? undefined : "5%"}>
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#868dfb",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="Dashboard"
            path="/web/dashboard"
            colors={colors}
            icon={<DashboardOutlined />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[100]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Data" : " "}
        </Typography>{" "}
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#868dfb",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="User"
            path="/web/users"
            colors={colors}
            icon={<PeopleAltOutlined />}
          />
          <Item
            title="POD"
            path="/web/pod"
            colors={colors}
            icon={<ContactsOutlined />}
          />
          <Item
            title="Stores"
            path="/web/store"
            colors={colors}
            icon={<StoreIcon />}
          />
          <Item
            title="Booking"
            path="/web/booking"
            colors={colors}
            icon={<ChecklistIcon />}
          />
          <Item
            title="Payment"
            path="/web/payment"
            colors={colors}
            icon={<PaymentIcon />}
          />
          <Item
            title="Product"
            path="/web/product"
            colors={colors}
            icon={<InventoryOutlined />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[100]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Pages" : " "}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#868dfb",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
         
     
       
        </Menu>
      </Box>
      <ToastContainer
                  position="top-center"
                  autoClose={false}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable={false}
                  pauseOnHover
                  theme="light"
                />
    </Sidebar>
  );
};

export default SideBar;
