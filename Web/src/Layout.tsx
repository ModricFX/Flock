import { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText, CssBaseline, Box, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeToggle from './components/dark-mode-toggle';

type LayoutProps = {
    children: React.ReactNode;
    darkMode: boolean;
    toggleDarkMode: () => void;
};

const Layout = ({ children, darkMode, toggleDarkMode }: LayoutProps) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: theme.palette.primary.main }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Flock
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <DarkModeToggle isDarkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </Toolbar>
            </AppBar>
            <Drawer
                variant="temporary"
                anchor={isSmallScreen ? 'top' : 'left'}
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: isSmallScreen ? '100%' : 240,
                        backgroundColor: theme.palette.background.default,
                    },
                }}
            >
                <List sx={{ mt: `${theme.mixins.toolbar.minHeight}px` }}>
                    <ListItem component="a" href="#" sx={{ color: theme.palette.text.primary }}>
                        <ListItemText primary="Home" />
                    </ListItem>
                    <ListItem component="a" href="#" sx={{ color: theme.palette.text.primary }}>
                        <ListItemText primary="About" />
                    </ListItem>
                    <ListItem component="a" href="#" sx={{ color: theme.palette.text.primary }}>
                        <ListItemText primary="Contact" />
                    </ListItem>
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout;