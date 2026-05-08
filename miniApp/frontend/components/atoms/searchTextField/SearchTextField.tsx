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
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (!value.trim()) return;
    onSearch(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  // 入力がある場合はラベルを消す。フォーカス時は専用ラベル、それ以外はデフォルトラベル。
  const displayLabel = value !== "" ? "" : (isFocused ? "ジャンル　エリア　店名など" : label);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ページのリロードを防ぐ
    handleSearch();
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <TextField
        fullWidth
        variant="outlined"
        label={displayLabel}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onClick={handleFocus}
        onBlur={handleBlur}
        className={styles.searchField}
        // ラベルが入力文字と重ならないよう、また浮き上がらないように制御
        InputLabelProps={{
          shrink: false, 
        }}
        slotProps={{
          input: {
            enterKeyHint: "search", // スマホキーボードのボタンを「検索」にする
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSearch}
                  className={styles.searchButton}
                >
                  <Search
                    size={24}
                    strokeWidth={2.5}
                    className={styles.icon}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </form>
  );
};
