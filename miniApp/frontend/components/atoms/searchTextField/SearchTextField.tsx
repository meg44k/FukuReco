"use client";

import { useState, KeyboardEvent } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Search } from "lucide-react";
import styles from "./SearchTextField.module.css";

type Props = {
  onSearch: (keyword: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  label?: string;
};

export const SearchTextField = ({ onSearch, onFocus, onBlur, label = "検索" }: Props) => {
  const [value, setValue] = useState("");

  const handleSearch = () => {
    if (!value.trim()) return;
    onSearch(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // IME変換中のエンターキー押下（変換確定）の場合は検索を実行しない
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={styles.searchField}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleSearch}
                className={styles.searchButton}
              >
                <Search
                  size={50}
                  strokeWidth={3}
                  className={styles.icon}
                />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
