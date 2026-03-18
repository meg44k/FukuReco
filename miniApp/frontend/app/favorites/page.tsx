"use client";
import React from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Button } from "@mui/material";

const FavoritesPage = () => {
  const restaurants = [
    { name: "なんとかラーメン", image: "/ramen.jpg" },
    { name: "なんとかラーメン", image: "/ramen.jpg" },
    { name: "なんとかラーメン", image: "/ramen.jpg" },
    { name: "なんとかラーメン", image: "/ramen.jpg" },
  ];

  const spots = [
    { name: "なんとかラーメン", image: "/ramen.jpg" },
    { name: "なんとかラーメン", image: "/ramen.jpg" },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>お気に入り</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>飲食店</h2>
        <div className={styles.grid}>
          {restaurants.map((item, index) => (
            <div key={index} className={styles.card}>
              <Image
                src={item.image}
                alt={item.name}
                fill
                style={{ objectFit: "cover" }}
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardName}>{item.name}</span>
                </div>
                <div className={styles.cardFooter}>
                  <Button
                    variant="contained"
                    className={styles.detailButton}
                    size="small"
                  >
                    もっと詳しく
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>観光スポット</h2>
        <div className={styles.grid}>
          {spots.map((item, index) => (
            <div key={index} className={styles.card}>
              <Image
                src={item.image}
                alt={item.name}
                fill
                style={{ objectFit: "cover" }}
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardName}>{item.name}</span>
                </div>
                <div className={styles.cardFooter}>
                  <Button
                    variant="contained"
                    className={styles.detailButton}
                    size="small"
                  >
                    もっと詳しく
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className={styles.spacer} />
    </div>
  );
};

export default FavoritesPage;
