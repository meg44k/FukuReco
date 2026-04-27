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
      {items.map((item, index) => (
        <div key={index} className={styles.infoRow}>
          <div className={styles.infoLabel}>{item.label}</div>
          <div className={styles.infoValue}>{item.value}</div>
        </div>
      ))}
    </div>
  );
};

// 補助的な共通パーツ（予算表示用など）もエクスポートしておくと便利
export const InfoLink: FunctionComponent<{ href: string; children: ReactNode }> = ({
  href,
  children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={styles.link}
  >
    {children}
  </a>
);

export const BudgetRow: FunctionComponent<{
  icon: ReactNode;
  iconBgColor: string;
  label: string | number;
}> = ({ icon, iconBgColor, label }) => (
  <div className={styles.budgetRow}>
    <span className={styles.budgetIcon} style={{ backgroundColor: iconBgColor }}>
      {icon}
    </span>
    <span>{label}</span>
  </div>
);
