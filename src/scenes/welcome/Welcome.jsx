import React, { createContext, useState } from "react";
import { Box, CssBaseline, ThemeProvider, Typography } from "@mui/material";
import { ColorModeContext, useMode } from "../../theme";

import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../layout/sidebar/SideBarComponent";
import Navbar from "../layout/navbar/NavBarComponent";

export const ToggledContext = createContext(null);

export default function Welcome() {
    const [theme, colorMode] = useMode();
    const [toggled, setToggled] = useState(false);
    const values = { toggled, setToggled };
    const location = useLocation();

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
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
                                        }}
                                    >
                                        Welcome to Dashboard
                                    </Typography>
                                )}
                                <Outlet />
                            </Box>
                        </Box>
                    </Box>
                </ToggledContext.Provider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}
