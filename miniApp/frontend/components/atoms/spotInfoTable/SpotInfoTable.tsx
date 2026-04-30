import React, { FunctionComponent, ReactNode } from "react";
import styles from "./SpotInfoTable.module.css";

export interface InfoItem {
  label: string;
  value: ReactNode;
}

interface Props {
  items: InfoItem[];
}

export const SpotInfoTable: FunctionComponent<Props> = ({ items }) => {
  return (
    <div className={styles.infoTable}>
      {items.map((item, index) => {
        let displayValue = item.value;

        // 配列のハンドリング
        if (Array.isArray(displayValue)) {
          if (displayValue.length > 0) {
            displayValue = displayValue.map((v, i) => <div key={i}>{v}</div>);
          } else {
            displayValue = null;
          }
        }

        // 判定用のフラグ
        const isEmpty = 
          displayValue === null || 
          displayValue === undefined || 
          displayValue === "" || 
          (Array.isArray(item.value) && item.value.length === 0);

        return (
          <div key={index} className={styles.infoRow}>
            <div className={styles.infoLabel}>{item.label}</div>
            <div className={styles.infoValue}>{isEmpty ? "情報なし" : displayValue}</div>
          </div>
        );
      })}
    </div>
  );
};

// 補助的な共通パーツ（リンク用）
export const InfoLink: FunctionComponent<{ href: string | null | undefined; children: ReactNode }> = ({
  href,
  children,
}) => {
  if (!href) return <>情報なし</>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
    >
      {children}
    </a>
  );
};

// 補助的な共通パーツ（予算表示用）
export const BudgetRow: FunctionComponent<{
  icon: ReactNode;
  iconBgColor: string;
  label: string | number | undefined | null;
}> = ({ icon, iconBgColor, label }) => {
  const displayLabel = (label ?? "") !== "" ? label : "情報なし";
  return (
    <div className={styles.budgetRow}>
      <span className={styles.budgetIcon} style={{ backgroundColor: iconBgColor }}>
        {icon}
      </span>
      <span>{displayLabel}</span>
    </div>
  );
};
