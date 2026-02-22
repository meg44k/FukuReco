"use client";
import React from "react";
import { 
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Paper
} from "@mui/material";
import{
    Map,
    Route,
    Heart,
    User,
    Search
} from "lucide-react";

export default function MenuBar(){
    const [value, setValue] = React.useState('map'); // Default to 'map'

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    const selectedStyle = {
        '&.Mui-selected': {
            color: '#3F7D58', // for the label
            '& svg': { // target the svg inside the selected action
                stroke: '#3F7D58',
            }
        }
    };

    // New style to prevent labels from wrapping
    const labelPreventWrapStyle = {
        minWidth: 0, // Override default min-width of BottomNavigationAction
        '& .MuiBottomNavigationAction-label': {
            whiteSpace: 'nowrap', // Prevent text from wrapping
            // Consider reducing font size if still too wide, e.g., fontSize: '0.7rem'
        }
    };

    return(
        <Box sx={{
            display: 'flex',
            width: '100%',
            gap: '10px', // The space between the two groups
            padding: '8px' // Add some padding around the component
        }}>
            {/* Left Group */}
            <Paper 
                elevation={0} // Removed drop shadow
                sx={{ 
                    flexGrow: 1, // Allow the left group to take up available space
                    backgroundColor: '#DEDEDE',
                    opacity: 0.9,
                    borderRadius: '13px',
                }}
            >
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={handleChange}
                    sx={{ backgroundColor: 'transparent' }}
                >
                    <BottomNavigationAction 
                        value="map" 
                        label="Map" 
                        icon={<Map/>} 
                        sx={{ ...labelPreventWrapStyle, ...selectedStyle }} // Combine styles
                    />
                    <BottomNavigationAction 
                        value="route" 
                        label="モデルコース" 
                        icon={<Route/>} 
                        sx={{ ...labelPreventWrapStyle, ...selectedStyle }} 
                    />
                    <BottomNavigationAction 
                        value="heart" 
                        label="保存" 
                        icon={<Heart/>} 
                        sx={{ ...labelPreventWrapStyle, ...selectedStyle }} 
                    />
                    <BottomNavigationAction 
                        value="user" 
                        label="マイページ" 
                        icon={<User/>} 
                        sx={{ ...labelPreventWrapStyle, ...selectedStyle }} 
                    />
                </BottomNavigation>
            </Paper>

            {/* Right Group */}
            <Paper 
                elevation={0} // Removed drop shadow
                sx={{ 
                    backgroundColor: '#DEDEDE',
                    opacity: 0.9,
                    borderRadius: '13px',
                    minWidth: '80px'
                }}
            >
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={handleChange}
                    sx={{ backgroundColor: 'transparent' }}
                >
                    <BottomNavigationAction 
                        value="search" 
                        label="検索" 
                        icon={<Search/>} 
                        sx={{ ...labelPreventWrapStyle, ...selectedStyle }} 
                    />
                </BottomNavigation>
            </Paper>
        </Box>
    )
}