"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Button } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import FavoriteButton from "@/components/atoms/favoriteButton/FavoriteButton";

import { ChevronDown, X, Bookmark } from "lucide-react";

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

const SpotListItem = ({ 
  item, 
  detailPath, 
  isFavorite, 
  onToggleFavorite,
  priority = false
}: { 
  item: FavoriteSpot, 
  detailPath: string,
  isFavorite: boolean,
  onToggleFavorite: () => void,
  priority?: boolean
}) => (
  <div className={styles.card}>
    <div className={styles.cardImageContainer}>
      <Image
        src={item.image}
        alt={item.name}
        fill
        style={{ objectFit: "cover" }}
        sizes="120px"
        priority={priority}
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

const Section = ({ 
  title, 
  items, 
  sectionKey, 
  emptyMessage,
  isExpanded,
  onToggle,
  isFavorite,
  onToggleFavorite,
  getDetailPath
}: { 
  title: string, 
  items: FavoriteSpot[], 
  sectionKey: string,
  emptyMessage: string,
  isExpanded: boolean,
  onToggle: () => void,
  isFavorite: (id: number) => boolean,
  onToggleFavorite: (id: number) => void,
  getDetailPath: (placeType: string, id: number) => string
}) => (
  <section className={styles.section}>
    <button 
      className={styles.sectionHeader} 
      onClick={onToggle}
      aria-expanded={isExpanded}
    >
      <h2 className={styles.sectionTitle}>{title} ({items.length})</h2>
      <ChevronDown 
        className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ""}`} 
        size={24}
      />
    </button>
    <div className={styles.headerBar} />
    
    <div className={`${styles.collapsibleContent} ${isExpanded ? styles.contentExpanded : ""}`}>
      <div className={styles.collapsibleInner}>
        {items.length > 0 ? (
          <div className={styles.grid}>
            {items.map((item, index) => (
              <SpotListItem 
                key={item.id} 
                item={item} 
                detailPath={getDetailPath(item.placeType, item.id)}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => onToggleFavorite(item.id)}
                priority={isExpanded && index < 2}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>{emptyMessage}</p>
        )}
      </div>
    </div>
  </section>
);

const FavoritesPage = () => {
  const router = useRouter();
  const { favorites: favIds, toggleFavorite, isFavorite, loading: favLoading } = useFavorites();
  const [favoriteDetails, setFavoriteDetails] = useState<FavoriteSpot[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(true);

  // 各セクションの開閉状態を管理
  const [expandedSections, setExpandedSections] = useState({
    restaurants: false,
    sightseeing: false,
    shops: false,
    resting: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
        <div className={styles.floatingHeader}>
          <button className={styles.navButton} onClick={() => router.push('/map')}>
            <X size={18} color="#3F7D58" />
          </button>
        </div>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <Bookmark className={styles.bookmarkIcon} size={24} fill="currentColor" />
            保存済み
          </h1>
        </header>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.floatingHeader}>
        <button className={styles.navButton} onClick={() => router.push('/map')}>
          <X size={18} color="#3F7D58" />
        </button>
      </div>
      
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Bookmark className={styles.bookmarkIcon} size={24} fill="currentColor" />
          保存済み
        </h1>
      </header>

      <Section 
        title="飲食店" 
        items={restaurants} 
        sectionKey="restaurants" 
        emptyMessage="保存済みの飲食店はまだありません。" 
        isExpanded={expandedSections.restaurants}
        onToggle={() => toggleSection("restaurants")}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        getDetailPath={getDetailPath}
      />

      <Section 
        title="観光スポット" 
        items={sightseeingSpots} 
        sectionKey="sightseeing" 
        emptyMessage="保存済みの観光スポットはまだありません。" 
        isExpanded={expandedSections.sightseeing}
        onToggle={() => toggleSection("sightseeing")}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        getDetailPath={getDetailPath}
      />

      <Section 
        title="ショップ" 
        items={shops} 
        sectionKey="shops" 
        emptyMessage="保存済みのショップはまだありません。" 
        isExpanded={expandedSections.shops}
        onToggle={() => toggleSection("shops")}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        getDetailPath={getDetailPath}
      />

      <Section 
        title="休憩スポット" 
        items={restingSpots} 
        sectionKey="resting" 
        emptyMessage="保存済みの休憩スポットはまだありません。" 
        isExpanded={expandedSections.resting}
        onToggle={() => toggleSection("resting")}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        getDetailPath={getDetailPath}
      />

      <div className={styles.spacer} />
    </div>
  );
};

export default FavoritesPage;
