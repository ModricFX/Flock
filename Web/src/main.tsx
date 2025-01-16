// src/main.tsx
import { StrictMode, useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// @ts-ignore
import './index.css';
import App from './App.tsx';
import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import Cookies from 'js-cookie';

const Root = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(() => {
        const cookiePreference = Cookies.get('darkMode');
        return cookiePreference ? cookiePreference === 'true' : prefersDarkMode;
    });

    useEffect(() => {
        Cookies.set('darkMode', darkMode.toString(), { expires: 365 });
    }, [darkMode]);

    // Update in main.tsx or where the ThemeProvider is used
    const theme = useMemo(
        () =>
          createTheme({
            palette: {
              mode: darkMode ? 'dark' : 'light',
              background: {
                default: darkMode ? '#1b1b1b' : '#ffffff',
              },
              text: {
                primary: darkMode ? '#ffffff' : '#000000',
              },
            },
          }),
        [darkMode]
      );


    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    return (
        <ThemeProvider theme={theme}>
            <App darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </ThemeProvider>
    );
};

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Root />
    </BrowserRouter>
);
