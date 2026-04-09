"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Button, CircularProgress } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import { useLIFF } from "@/providers/liff-providers";

interface FavoriteSpot {
  id: number;
  name: string;
  image: string;
  placeType: string;
}

const FavoritesPage = () => {
  const { liff } = useLIFF();
  const [favorites, setFavorites] = useState<FavoriteSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      // Use debug ID from env if available, otherwise get from LIFF
      let lineId = process.env.NEXT_PUBLIC_DEBUG_LINE_ID || null;

      if (!lineId) {
        if (!liff || !liff.isLoggedIn()) {
          setLoading(false);
          return;
        }
        try {
          const profile = await liff.getProfile();
          lineId = profile.userId;
        } catch (error) {
          console.error("Error getting LIFF profile:", error);
          setLoading(false);
          return;
        }
      }

      try {
        const supabase = createClient();

        // Fetch favorites for this user
        const { data: favData, error: favError } = await supabase
          .from("favorites")
          .select("spot_id")
          .eq("user_id", lineId);

        if (favError) throw favError;

        if (favData && favData.length > 0) {
          const spotIds = favData.map((f) => f.spot_id);

          // Fetch spot details
          const { data: spotData, error: spotError } = await supabase
            .from("spots")
            .select("id, name, place_type")
            .in("id", spotIds);

          if (spotError) throw spotError;

          // Fetch one asset (image) for each spot
          const { data: assetData, error: assetError } = await supabase
            .from("assets")
            .select("spot_id, url")
            .in("spot_id", spotIds);

          if (assetError) throw assetError;

          const assetMap = assetData.reduce((acc: Record<number, string>, asset: { spot_id: number, url: string }) => {
            if (!acc[asset.spot_id]) {
              acc[asset.spot_id] = asset.url;
            }
            return acc;
          }, {});

          const formattedFavorites: FavoriteSpot[] = spotData.map((spot: { id: number, name: string, place_type: string }) => ({
            id: spot.id,
            name: spot.name,
            placeType: spot.place_type,
            image: assetMap[spot.id] || "/ramen.jpg", // Fallback image
          }));

          setFavorites(formattedFavorites);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [liff]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress color="inherit" />
      </div>
    );
  }

  const restaurants = favorites.filter((f) => f.placeType === "restaurant" || f.placeType === "飲食店");
  const otherSpots = favorites.filter((f) => f.placeType !== "restaurant" && f.placeType !== "飲食店");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>お気に入り</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>飲食店</h2>
        {restaurants.length > 0 ? (
          <div className={styles.grid}>
            {restaurants.map((item) => (
              <div key={item.id} className={styles.card}>
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
                    <Link href={`/spots/restaurant/${item.id}`} passHref>
                      <Button
                        variant="contained"
                        className={styles.detailButton}
                        size="small"
                        component="span"
                      >
                        もっと詳しく
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>お気に入りの飲食店はまだありません。</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>観光スポット</h2>
        {otherSpots.length > 0 ? (
          <div className={styles.grid}>
            {otherSpots.map((item) => (
              <div key={item.id} className={styles.card}>
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
                    <Link href={`/spots/sightseeing/${item.id}`} passHref>
                      <Button
                        variant="contained"
                        className={styles.detailButton}
                        size="small"
                        component="span"
                      >
                        もっと詳しく
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>お気に入りの観光スポットはまだありません。</p>
        )}
      </section>
      <div className={styles.spacer} />
    </div>
  );
};

export default FavoritesPage;
