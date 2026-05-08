"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Button } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import FavoriteButton from "@/components/atoms/favoriteButton/FavoriteButton";

interface FavoriteSpot {
  id: number;
  name: string;
  image: string;
  placeType: string;
  tags: string[];
}

// ヘルパー関数: スポット種別の判定
const isRestaurant = (placeType: string) => {
  const type = (placeType || "").toLowerCase();
  return type === "restaurant" || type === "cafe" || type === "飲食店";
};

const isShop = (placeType: string) => {
  const type = (placeType || "").toLowerCase();
  return type === "shop" || type === "gift_spot";
};

const isRestingSpot = (placeType: string) => {
  const type = (placeType || "").toLowerCase();
  return type === "resting_spot";
};

const isSightseeingSpot = (placeType: string) => {
  const type = (placeType || "").toLowerCase();
  return type === "sightseeing" || type === "sightseeing_spot";
};

const SpotListItemSkeleton = () => (
  <div className={styles.card}>
    <div className={`${styles.cardImageContainer} ${styles.skeleton}`} />
    <div className={styles.cardContent}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <div className={`${styles.skeleton}`} style={{ width: '60%', height: '20px', borderRadius: '4px' }} />
          <div className={`${styles.skeleton}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
        </div>
        <div className={styles.tags} style={{ marginTop: '8px' }}>
          <div className={`${styles.skeleton}`} style={{ width: '50px', height: '18px', borderRadius: '4px' }} />
          <div className={`${styles.skeleton}`} style={{ width: '50px', height: '18px', borderRadius: '4px' }} />
        </div>
      </div>
      <div className={styles.cardFooter}>
        <div className={`${styles.skeleton}`} style={{ width: '100px', height: '30px', borderRadius: '9999px' }} />
      </div>
    </div>
  </div>
);

const SpotListItem = ({ 
  item, 
  detailPath, 
  isFavorite, 
  onToggleFavorite 
}: { 
  item: FavoriteSpot, 
  detailPath: string,
  isFavorite: boolean,
  onToggleFavorite: () => void
}) => (
  <div className={styles.card}>
    <div className={styles.cardImageContainer}>
      <Image
        src={item.image}
        alt={item.name}
        fill
        style={{ objectFit: "cover" }}
      />
    </div>
    <div className={styles.cardContent}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h3 className={styles.cardName}>{item.name}</h3>
          <FavoriteButton 
            isFavorite={isFavorite} 
            onClick={onToggleFavorite}
          />
        </div>
        <div className={styles.tags}>
          {item.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className={styles.tag}>#{tag}</span>
          ))}
        </div>
      </div>
      <div className={styles.cardFooter}>
        <Link href={detailPath} passHref>
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
);

const FavoritesPage = () => {
  const { favorites: favIds, toggleFavorite, isFavorite, loading: favLoading } = useFavorites();
  const [favoriteDetails, setFavoriteDetails] = useState<FavoriteSpot[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteDetails = async () => {
      if (favIds.length === 0) {
        setFavoriteDetails([]);
        setDetailsLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Fetch spot details with tags
        const { data: spotData, error: spotError } = await supabase
          .from("spots")
          .select(`
            id, 
            name, 
            place_type,
            spot_tags (
              tags (
                detail
              )
            )
          `)
          .in("id", favIds);

        if (spotError) throw spotError;

        // Fetch one asset (image) for each spot
        const { data: assetData, error: assetError } = await supabase
          .from("assets")
          .select("spot_id, url, is_cardthumbnail")
          .in("spot_id", favIds);

        if (assetError) throw assetError;

        // Map assets, prioritizing thumbnails
        const assetMap = assetData.reduce((acc: Record<number, string>, asset: { spot_id: number, url: string, is_cardthumbnail: boolean }) => {
          if (!acc[asset.spot_id] || asset.is_cardthumbnail) {
            acc[asset.spot_id] = asset.url;
          }
          return acc;
        }, {});

        const formattedDetails: FavoriteSpot[] = spotData.map((spot: any) => ({
          id: spot.id,
          name: spot.name,
          placeType: spot.place_type,
          image: assetMap[spot.id] || "/sampleImage.png",
          tags: spot.spot_tags?.map((st: any) => {
            const tags = st.tags;
            return Array.isArray(tags) ? tags[0]?.detail : tags?.detail;
          }).filter(Boolean) || [],
        }));

        setFavoriteDetails(formattedDetails);
      } catch (error) {
        console.error("Error fetching favorite details:", error);
      } finally {
        setDetailsLoading(false);
      }
    };

    if (!favLoading) {
      fetchFavoriteDetails();
    }
  }, [favIds, favLoading]);

  const getDetailPath = (placeType: string, id: number) => {
    if (isRestaurant(placeType)) return `/spots/restaurant/${id}`;
    if (isSightseeingSpot(placeType)) return `/spots/sightseeing/${id}`;
    if (isShop(placeType)) return `/spots/shop/${id}`;
    if (isRestingSpot(placeType)) return `/spots/resting/${id}`;
    return `/spots/sightseeing/${id}`;
  };

  // お気に入りIDリスト(favIds)に含まれているものだけを即時反映してフィルタリング
  const restaurants = useMemo(() => 
    favoriteDetails.filter((f) => favIds.includes(f.id) && isRestaurant(f.placeType)),
    [favoriteDetails, favIds]
  );

  const shops = useMemo(() => 
    favoriteDetails.filter((f) => favIds.includes(f.id) && isShop(f.placeType)),
    [favoriteDetails, favIds]
  );

  const restingSpots = useMemo(() => 
    favoriteDetails.filter((f) => favIds.includes(f.id) && isRestingSpot(f.placeType)),
    [favoriteDetails, favIds]
  );
  
  const sightseeingSpots = useMemo(() => 
    favoriteDetails.filter((f) => 
      favIds.includes(f.id) && (
        isSightseeingSpot(f.placeType) || 
        (!isRestaurant(f.placeType) && !isShop(f.placeType) && !isRestingSpot(f.placeType))
      )
    ),
    [favoriteDetails, favIds]
  );

  if (favLoading || detailsLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>お気に入り</h1>
        <div className={styles.grid}>
          {[...Array(3)].map((_, i) => <SpotListItemSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>お気に入り</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>飲食店</h2>
        {restaurants.length > 0 ? (
          <div className={styles.grid}>
            {restaurants.map((item) => (
              <SpotListItem 
                key={item.id} 
                item={item} 
                detailPath={getDetailPath(item.placeType, item.id)}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>お気に入りの飲食店はまだありません。</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>観光スポット</h2>
        {sightseeingSpots.length > 0 ? (
          <div className={styles.grid}>
            {sightseeingSpots.map((item) => (
              <SpotListItem 
                key={item.id} 
                item={item} 
                detailPath={getDetailPath(item.placeType, item.id)}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>お気に入りの観光スポットはまだありません。</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ショップ</h2>
        {shops.length > 0 ? (
          <div className={styles.grid}>
            {shops.map((item) => (
              <SpotListItem 
                key={item.id} 
                item={item} 
                detailPath={getDetailPath(item.placeType, item.id)}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>お気に入りのショップはまだありません。</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>休憩スポット</h2>
        {restingSpots.length > 0 ? (
          <div className={styles.grid}>
            {restingSpots.map((item) => (
              <SpotListItem 
                key={item.id} 
                item={item} 
                detailPath={getDetailPath(item.placeType, item.id)}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>お気に入りの休憩スポットはまだありません。</p>
        )}
      </section>
      <div className={styles.spacer} />
    </div>
  );
};

export default FavoritesPage;
