import React, { createContext, useState } from "react";
import { Box, CssBaseline, ThemeProvider, Typography } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Navbar, SideBar } from "./scenes";
import { Outlet, useLocation } from "react-router-dom";

export const ToggledContext = createContext(null);

function App() {
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
                        <SideBar />
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                                maxWidth: "100%",
                            }}
                        >
                            <Navbar />
                            <Box
                                sx={{
                                    overflowY: "auto",
                                    flex: 1,
                                    maxWidth: "100%",
                                }}
                            >
                                {location.pathname === "/" && (
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

export default App;
