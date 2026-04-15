"use client";

import React from "react";
import { IconButton } from "@mui/material";
import { Menu, X } from "lucide-react";
import styles from "./MenuButton.module.css";

type Props = {
  onClick: () => void;
  isClose?: boolean;
};

export const MenuButton = ({ onClick, isClose = false }: Props) => {
  return (
    <IconButton className={styles.menuButton} onClick={onClick}>
      {isClose ? <X className={styles.icon} /> : <Menu className={styles.icon} />}
    </IconButton>
  );
};
