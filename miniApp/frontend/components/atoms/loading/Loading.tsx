import React from "react";
import styles from "./Loading.module.css";

const Loading = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <span className={styles.loadingText}>読み込み中...</span>
    </div>
  );
};

export default Loading;
