'use client'

import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  AppBar, 
  Toolbar, 
  Avatar, 
  Divider 
} from '@mui/material';
import { 
  LayoutDashboard, 
  MapPin, 
  Settings, 
  LogOut, 
  Users, 
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DRAWER_WIDTH = 260;

const MENU_ITEMS = [
  { text: 'ダッシュボード', icon: <LayoutDashboard size={20} />, href: '/admin' },
  { text: 'スポット管理', icon: <MapPin size={20} />, href: '/admin/spots' },
  { text: '写真ギャラリー', icon: <ImageIcon size={20} />, href: '/admin/photos' },
  { text: 'ユーザー管理', icon: <Users size={20} />, href: '/admin/users' },
  { text: 'イベント設定', icon: <Calendar size={20} />, href: '/admin/events' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* サイドバー */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
            bgcolor: '#ffffff',
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 1 }}>
            <MapPin color="white" size={24} />
          </Box>
          <Typography variant="h6" fontWeight="800" color="primary">
            FukuReco <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>Admin</Typography>
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        <List sx={{ px: 2 }}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': { bgcolor: 'primary.lighter' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem' }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><Settings size={20} /></ListItemIcon>
              <ListItemText primary="設定" primaryTypographyProps={{ fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2, color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><LogOut size={20} /></ListItemIcon>
              <ListItemText primary="ログアウト" primaryTypographyProps={{ fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>

      {/* メインコンテンツ */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar 
          position="sticky" 
          elevation={0} 
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #e0e0e0',
            color: 'text.primary'
          }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" fontWeight="600">管理者 太郎</Typography>
              <Typography variant="caption" color="text.secondary">システム管理者</Typography>
            </Box>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>AD</Avatar>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: 4 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
