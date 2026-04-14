"use client";

import React from "react";
import { IconButton } from "@mui/material";
import { Menu } from "lucide-react";
import styles from "./MenuButton.module.css";

type Props = {
  onClick: () => void;
};

export const MenuButton = ({ onClick }: Props) => {
  return (
    <IconButton className={styles.menuButton} onClick={onClick}>
      <Menu className={styles.icon} />
    </IconButton>
  );
};
