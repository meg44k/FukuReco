"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Paper
} from "@mui/material";
import{
    Map,
    Route,
    Bookmark,
    User,
    Search
} from "lucide-react";

export default function MenuBar(){
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) {
        return null;
    }

    // Mapping between pathname and BottomNavigation value
    const getValueFromPath = (path: string) => {
        if (path.startsWith('/maps')) return 'map';
        if (path.startsWith('/modelcourse')) return 'route';
        if (path.startsWith('/favorites')) return 'bookmark';
        if (path.startsWith('/mypage')) return 'user';
        if (path.startsWith('/search')) return 'search';
        return 'map';
    };

    const value = getValueFromPath(pathname);

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
            width: '95vw',
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
                    sx={{ backgroundColor: 'transparent' }}
                >
                    <BottomNavigationAction 
                        value="map" 
                        label="Map" 
                        icon={<Map/>} 
                        component={Link}
                        href="/maps"
                        sx={{ ...labelPreventWrapStyle, ...selectedStyle }} // Combine styles
                    />
                    <BottomNavigationAction 
                        value="route" 
                        label="モデルコース" 
                        icon={<Route/>} 
                        component={Link}
                        href="/modelcourse"
                        sx={{ ...labelPreventWrapStyle, ...selectedStyle }} 
                    />
                    <BottomNavigationAction 
                        value="bookmark" 
                        label="保存" 
                        icon={<Bookmark/>} 
                        component={Link}
                        href="/favorites"
                        sx={{ ...labelPreventWrapStyle, ...selectedStyle }} 
                    />
                    <BottomNavigationAction 
                        value="user" 
                        label="マイページ" 
                        icon={<User/>} 
                        component={Link}
                        href="/mypage"
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
                    sx={{ backgroundColor: 'transparent' }}
                >
                    <BottomNavigationAction 
                        value="search" 
                        label="検索" 
                        icon={<Search/>} 
                        component={Link}
                        href="/search"
                        sx={{ ...labelPreventWrapStyle, ...selectedStyle }} 
                    />
                </BottomNavigation>
            </Paper>
        </Box>
    )
}