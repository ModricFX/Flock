// src/settings/dark-mode-toggle.tsx
import { IconButton } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

type DarkModeToggleProps = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    sx?: object;
};

const DarkModeToggle = ({ isDarkMode, toggleDarkMode, sx }: DarkModeToggleProps) => {
    return (
        <IconButton onClick={toggleDarkMode} color="inherit" sx={sx}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
    );
};

export default DarkModeToggle;