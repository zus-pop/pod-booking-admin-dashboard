import React, { createContext, useState, useEffect } from "react";
import { Box, CssBaseline, ThemeProvider, Typography, Fade } from "@mui/material";
import { ColorModeContext, useMode } from "../../theme";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SideBar from "../layout/sidebar/SideBarComponent";
import Navbar from "../layout/navbar/NavBarComponent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { RoleProvider } from "../../RoleContext";
export const ToggledContext = createContext(null);

export default function Welcome() {
    const [theme, colorMode] = useMode();
    const [toggled, setToggled] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const values = { toggled, setToggled };
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname === "/web") {
            // Bắt đầu hiệu ứng fade out sau 4 giây
            const fadeTimer = setTimeout(() => {
                setFadeOut(true);
            }, 2000);

            // Chuyển trang sau 5 giây
            const navigationTimer = setTimeout(() => {
                navigate('/web/dashboard');
            }, 3000);

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(navigationTimer);
            };
        }
    }, [location.pathname, navigate]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
            <RoleProvider>
                <CssBaseline />
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                <ToggledContext.Provider value={values}>
                    <Box
                        sx={{
                            display: "flex",
                            height: "100vh",
                            maxWidth: "100%",
                        }}
                    >
                        <SideBar/>
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                                maxWidth: "100%",
                            }}
                        >
                            <Navbar/>
                            <Box
                                sx={{
                                    overflowY: "auto",
                                    flex: 1,
                                    maxWidth: "100%",
                                }}
                            >
                                {location.pathname === "/web" && (
                                    <Fade in={!fadeOut} timeout={1000}>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontSize: "80px",
                                                fontWeight: "bold",
                                                height: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: theme.palette.text.primary,
                                                transition: "opacity 1s ease-out",
                                            }}
                                        >
                                            Welcome to Dashboard
                                        </Typography>
                                    </Fade>
                                )}
                                <Outlet />
                            </Box>
                        </Box>
                    </Box>
                </ToggledContext.Provider>
              </RoleProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}