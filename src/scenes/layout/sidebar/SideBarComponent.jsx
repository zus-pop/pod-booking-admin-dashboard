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
  AttachMoneyTwoTone,
} from "@mui/icons-material";
import BarChartIcon from '@mui/icons-material/BarChart';
import StoreIcon from "@mui/icons-material/Store";
import PaymentIcon from "@mui/icons-material/Payment";
import ChecklistIcon from "@mui/icons-material/Checklist";
import logo from "../../../assets/images/logo.png";
import Item from "./Item";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToggledContext } from "../../welcome/Welcome";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRole } from "../../../RoleContext";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import axiosInstance from '../../../api/axios';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';

const SideBar = () => {
  const { setUserRole } = useRole();
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
        console.log("sidebar")
        navigate("/", { replace: true });
        return;
      }
      try {
        const response = await axiosInstance.get("/api/v1/auth/profile");
        if (response.status === 200) {
          setUserRole(response.data.role.role_name);
          setUserName(response.data.user_name);
          setRole(response.data.role.role_name);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
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
          {!collapsed ? "Chart" : " "}
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
            title="Total Revenue"
            path="/web/line"
            colors={colors}
            icon={<BarChartIcon />}
          />
        
          <Item
            title="POD Revenue"
            path="/web/pod-revenue"
            colors={colors}
            icon={<MonetizationOnIcon />}
          />
          <Item
            title="Store Revenue"
            path="/web/store-revenue"
            colors={colors}
            icon={<StorefrontIcon />}
          />
          <Item
            title="Refund Analysis"
            path="/web/refund-analysis"
            colors={colors}
            icon={<AttachMoneyTwoTone />}
          />
          
        </Menu>
      </Box>
    </Sidebar>
  );
};

export default SideBar;
