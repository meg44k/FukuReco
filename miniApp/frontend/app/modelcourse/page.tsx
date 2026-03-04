"use client";
import React from "react";
import styles from "./page.module.css";

const ModelCoursePage = () => {
  const sections = [
    {
      title: "時間で選ぶ",
      items: ["1時間", "2時間", "3時間"]
    },
    {
      title: "日数で選ぶ",
      items: ["1泊2日", "2泊3日", "3泊4日"]
    },
    {
      title: "エリアで選ぶ",
      items: ["博多エリア", "天神エリア", "中洲エリア"]
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>モデルコース</h1>
      
      {sections.map((section, index) => (
        <div key={index} className={styles.section}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <div className={styles.courseGrid}>
            {section.items.map((item, i) => (
              <div key={i} className={styles.courseCard}>
                <span className={styles.courseLabel}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Spacer for bottom navigation */}
      <div className={styles.spacer} />
    </div>
  );
};

export default ModelCoursePage;
