"use client"
import { createClient } from '@/lib/supabase/client';
import { notFound, useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import styles from '../page.module.css'; 
import btnStyles from '@/styles/common-buttons.module.css';
import {
  Clock,
  ExternalLink,
  Heart,
  ChevronLeft,
  X,
} from "lucide-react";
import { Menu } from '@/types/menu'

import RecommendMenu from "@/components/atoms/recommendMenu/RecommendMenu";
import PhotoGallery from "@/components/atoms/photoGallery/PhotoGallery";
import Tags from "@/components/atoms/tags/Tags";
import { useFavorites } from '@/hooks/useFavorites';
import NearbySpots from "@/components/organisms/nearbySpots/NearbySpots";
import { SpotInfoTable, InfoLink } from "@/components/atoms/spotInfoTable/SpotInfoTable";
import { Disclaimer } from "@/components/atoms/disclaimer/Disclaimer";
import { mapToShop, RawShop } from "@/lib/spot-mapper";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ShopDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [spotData, setSpotData] = useState<Record<string, unknown> | null>(null);
  const [menuData, setMenuData] = useState<Record<string, unknown>[]>([]);
  const [assetData, setAssetData] = useState<Record<string, unknown>[]>([]);
  const [tagData, setTagData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const spotId = !isNaN(Number(id)) ? Number(id) : id;

      const [spotRes, menuRes, assetRes, tagRes] = await Promise.all([
        supabase.from('spots').select('*').eq('id', spotId).single(),
        supabase.from('menus').select('*').eq('spot_id', spotId),
        supabase.from('assets').select('*').eq('spot_id', spotId),
        supabase.from('spot_tags').select('tags(detail)').eq('spot_id', spotId)
      ]);

      const type = (spotRes.data.place_type || "").toLowerCase();
      if (spotRes.error || !spotRes.data || (type !== 'shop' && type !== 'gift_spot')) {
        setHasError(true);
        setLoading(false);
        return;
      }

      setSpotData(spotRes.data);
      setMenuData(menuRes.data || []);
      setAssetData(assetRes.data || []);

      const rawTags = tagRes.data as unknown as { tags: { detail: string } | { detail: string }[] | null }[];
      const tags = rawTags?.map((item) => {
        if (Array.isArray(item.tags)) {
          return item.tags[0]?.detail;
        }
        return item.tags?.detail;
      }).filter((detail): detail is string => !!detail) || [];
      setTagData(tags);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (hasError) {
    notFound();
  }

  if (loading || !spotData) return null;

  const spot = mapToShop(spotData as unknown as RawShop);

  const assetMap = (assetData as unknown as { id: number, url: string }[]).reduce((acc, asset) => {
    acc[asset.id] = asset.url;
    return acc;
  }, {} as Record<number, string>);

  const menus: Menu[] = (menuData as unknown as { spot_id: number, name: string, price: number, detail: string, asset_id: number, is_recommend: boolean }[]).map(m => ({
    spotId: m.spot_id,
    name: m.name,
    price: m.price,
    detail: m.detail,
    assetId: m.asset_id ? assetMap[m.asset_id] : undefined,
    isRecommend: m.is_recommend
  }));

  const recommendMenus = menus.filter(m => m.isRecommend);
  const photoUrls = assetData
    ? (assetData as unknown as { is_photo_gallery: boolean, gallery_order: number, url: string }[])
        .filter((a) => a.is_photo_gallery === true)
        .sort((a, b) => (a.gallery_order ?? Infinity) - (b.gallery_order ?? Infinity))
        .map((a) => a.url)
    : [];

  return (
    <div className={styles.container}>
      {/* Floating Navigation */}
      <div className={`${styles.floatingHeader} ${showNav ? styles.navVisible : styles.navHidden}`}>
        <button className={styles.navButton} onClick={() => router.back()}>
          <ChevronLeft size={18} color="#3F7D58" />
        </button>
        <button className={styles.navButton} onClick={() => router.push('/map')}>
          <X size={18} color="#3F7D58" />
        </button>
      </div>

      {/* Header Carousel */}
      <PhotoGallery key={id} images={photoUrls} />

      {/* Content Section */}
      <div className={styles.content}>
        <p className={styles.catchphrase}>{spot.catchphrase}</p>
        <h1 className={styles.title}>{spot.name}</h1>
        <div className={styles.updatedAt}>
          更新日: {spot.updatedAt.toLocaleDateString('ja-JP')}
        </div>
        <Tags tags={tagData} />
      </div>

      {/* Safety Info Section */}
      <div className={styles.safetySection}>
        <div className={styles.safetyTitle}>
          <Clock size={20} />
          <span>知っておくと安心！</span>
        </div>
        <div className={styles.safetyCard}>
          <p className={styles.safetyLabel}>最寄り駅/バス停</p>
          <p className={styles.safetyValue}>{spot.nearestStation || '情報なし'}</p>
        </div>
        <div className={styles.safetyCard}>
          <p className={styles.safetyLabel}>空港・駅から（最短）</p>
          <p className={styles.safetyValue}>{spot.distanceFromTransit || '情報なし'}</p>
        </div>
        <div className={styles.safetyGrid}>
          <div className={styles.safetyCard}>
            <p className={styles.safetyLabel}>滞在目安</p>
            <p className={styles.safetyValue}>{spot.stayDuration || '情報なし'}</p>
          </div>
          <div className={styles.safetyCard}>
            <p className={styles.safetyLabel}>近くのコインロッカー</p>
            <p className={`${styles.safetyValue} ${styles.link}`}>{spot.nearbyCoinLockers || '情報なし'}</p>
          </div>
        </div>
      </div>

      {/* Recommend Menu / Items */}
      {recommendMenus.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBar}></div>
            <h2 className={styles.sectionTitle}>おすすめの商品</h2>
          </div>
          {recommendMenus.map((menu, index) => <RecommendMenu key={index} recommendMenu={menu} />)}
        </div>
      )}

      {/* Staff Comment */}
      <div className={styles.section}>
        <div className={styles.staffComment}>
          <p className={styles.commentText}>{spot.fukurekoComment}</p>
          <p className={styles.commentAuthor}>— フクレコ運営スタッフ</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBar}></div>
          <h2 className={styles.sectionTitle}>基本情報</h2>
        </div>
        <SpotInfoTable 
          items={[
            { label: "住所", value: spot.address },
            { label: "営業時間", value: spot.businessHours },
            { label: "電話番号", value: spot.phoneNumber },
            { label: "定休日", value: spot.closedDays },
            { label: "支払方法", value: spot.paymentMethods },
            { label: "駐車場", value: spot.parkingInfo },
            { 
              label: "ウェブサイト", 
              value: <InfoLink href={spot.websiteUrl}>{spot.websiteUrl}</InfoLink>
            },
            { label: "スポットコメント", value: spot.shopComment },
            { label: "備考", value: spot.remarks },
          ]}
        />
      </div>

      {/* Nearby Spots Section */}
      {typeof spot.latitude === 'number' && typeof spot.longitude === 'number' && !isNaN(spot.latitude) && !isNaN(spot.longitude) && (
        <NearbySpots 
          lat={spot.latitude} 
          lng={spot.longitude} 
          currentId={spot.id} 
        />
      )}

      <Disclaimer />

      {/* Action Footer */}
      <div className={styles.actionFooter}>
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${spot.name} ${spot.address}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btnStyles.routeBtn}
          style={{ flex: 1.5 }}
        >
          ルートを見る <ExternalLink size={18} />
        </a>
        <button 
          className={btnStyles.heartBtn}
          onClick={() => toggleFavorite(id)}
        >
          <Heart 
            size={24} 
            fill={isFavorite(id) ? "#EF5350" : "none"} 
            color={isFavorite(id) ? "#EF5350" : "currentColor"}
          />
        </button>
      </div>
    </div>
  );
}

