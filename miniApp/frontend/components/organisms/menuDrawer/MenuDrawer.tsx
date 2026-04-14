"use client";

import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import {
  Heart,
  Bell,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const MenuDrawer = ({ open, onClose }: Props) => {
  const menuItems = [
    { text: "保存済み", icon: <Heart size={20} />, href: "/favorites" },
    { text: "お知らせ", icon: <Bell size={20} />, href: "/news" },
  ];

  const subMenuItems = [
    { text: "よくある質問", icon: <HelpCircle size={20} />, href: "/faq" },
    { text: "お問い合わせ", icon: <MessageCircle size={20} />, href: "/contact" },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          borderRadius: "20px 0 0 20px",
          padding: "16px 8px",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ padding: "16px 16px 24px" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3F7D58" }}>
            FukuReco
          </Typography>
          <Typography variant="caption" color="text.secondary">
            福岡をもっと楽しもう
          </Typography>
        </Box>

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={onClose} sx={{ borderRadius: "10px", margin: "4px 8px" }}>
                <ListItemIcon sx={{ minWidth: 40, color: "#3F7D58" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 500 }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ margin: "16px 0" }} />

        <List>
          {subMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={onClose} sx={{ borderRadius: "10px", margin: "4px 8px" }}>
                <ListItemIcon sx={{ minWidth: 40, color: "#666" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: "0.95rem", color: "#333" }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* フッター項目（下部に固定） */}
      <Box sx={{ padding: "16px", textAlign: "center", borderTop: "1px solid #eee" }}>
        <Box sx={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "8px" }}>
          <Typography 
            variant="caption" 
            sx={{ color: "text.secondary", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            利用規約
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ color: "text.secondary", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            プライバシーポリシー
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "#ccc", fontSize: "0.7rem" }}>
          &copy; 2026 FukuReco
        </Typography>
      </Box>
    </Drawer>
  );
};
