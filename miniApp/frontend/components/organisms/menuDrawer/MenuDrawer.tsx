"use client";

import React from "react";
import Link from "next/link";
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
  IconButton,
} from "@mui/material";
import {
  Bookmark,
  Bell,
  HelpCircle,
  MessageCircle,
  X,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const MenuDrawer = ({ open, onClose }: Props) => {
  const menuItems = [
    { text: "保存済み", icon: <Bookmark size={20} />, href: "/favorites" },
  ];

  const subMenuItems = [
    { text: "よくある質問", icon: <HelpCircle size={20} />, href: "https://fukureco.jp/faqs/" },
    { text: "お問い合わせ", icon: <MessageCircle size={20} />, href: "https://fukureco.jp/contact/" },
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
        <Box sx={{ padding: "16px 16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3F7D58" }}>
            メニュー
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#3F7D58" }} size="small">
            <X size={24} />
          </IconButton>
        </Box>

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link}
                href={item.href}
                onClick={onClose} 
                sx={{ borderRadius: "10px", margin: "4px 8px" }}
              >
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
              <ListItemButton 
                component="a"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose} 
                sx={{ borderRadius: "10px", margin: "4px 8px" }}
              >
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
            sx={{ color: "text.secondary", cursor: "pointer", "&:hover": { textDecoration: "underline" }, textDecoration: "none" }}
            component="a"
            href="https://fukureco.jp/terms/"
            target="_blank"
            rel="noopener noreferrer"
          >
            利用規約
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ color: "text.secondary", cursor: "pointer", "&:hover": { textDecoration: "underline" }, textDecoration: "none" }}
            component="a"
            href="https://fukureco.jp/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            プライバシーポリシー
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "#ccc", fontSize: "0.7rem" }}>
          &copy; 2026 フクレコ
        </Typography>
      </Box>
    </Drawer>
  );
};
