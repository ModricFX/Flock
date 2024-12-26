// src/settings/dark-mode-toggle.tsx
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

type DarkModeToggleProps = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    sx?: object;
};

const DarkModeToggle = ({ isDarkMode, toggleDarkMode, sx }: DarkModeToggleProps) => {
    return (
        <IconButton onClick={toggleDarkMode} color="inherit" sx={sx}>
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
    );
};

export default DarkModeToggle;