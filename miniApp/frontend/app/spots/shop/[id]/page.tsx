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
import { Shop } from '@/types/spot'
import { Menu } from '@/types/menu'

import RecommendMenu from "@/components/atoms/recommendMenu/RecommendMenu";
import PhotoGallery from "@/components/atoms/photoGallery/PhotoGallery";
import Tags from "@/components/atoms/tags/Tags";
import { useFavorites } from '@/hooks/useFavorites';
import NearbySpots from "@/components/organisms/nearbySpots/NearbySpots";

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

  // Cast dynamic data to internal interfaces for property access
  const spotRaw = spotData as unknown as {
    id: number;
    name: string;
    catchphrase?: string;
    distance_from_transit?: string;
    stay_duration?: string;
    fukureko_comment?: string;
    address: string;
    business_hours?: string;
    phone_number?: string;
    nearest_station?: string;
    website_url?: string;
    average_budget?: string | number;
    place_type: string;
    pricing?: Record<string, unknown>;
    facilities?: Record<string, unknown>;
    updated_at: string;
    created_at: string;
    nearby_coin_lockers?: string;
    parking_info?: string;
    payment_methods?: string[];
    closed_days?: string;
    shop_comment?: string;
    remarks?: string;
  };

  const spot: Shop = {
    id: spotRaw.id,
    name: spotRaw.name,
    catchphrase: spotRaw.catchphrase,
    distanceFromTransit: spotRaw.distance_from_transit,
    stayDuration: spotRaw.stay_duration,
    fukurekoComment: spotRaw.fukureko_comment,
    address: spotRaw.address,
    businessHours: spotRaw.business_hours,
    phoneNumber: spotRaw.phone_number,
    nearestStation: spotRaw.nearest_station,
    websiteUrl: spotRaw.website_url,
    averageBudget: spotRaw.average_budget,
    placeType: spotRaw.place_type,
    pricing: spotRaw.pricing || {},
    facilities: spotRaw.facilities || {},
    updatedAt: new Date(spotRaw.updated_at),
    createdAt: new Date(spotRaw.created_at),
    nearbyCoinLockers: spotRaw.nearby_coin_lockers,
    parkingInfo: spotRaw.parking_info,
    paymentMethods: spotRaw.payment_methods,
    closedDays: spotRaw.closed_days,
    shopComment: spotRaw.shop_comment,
    remarks: spotRaw.remarks,
  };

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
        <button className={styles.navButton} onClick={() => router.push('/maps')}>
          <X size={18} color="#3F7D58" />
        </button>
      </div>

      {/* Header Carousel */}
      <div className={styles.header}>
        <PhotoGallery images={photoUrls} />
      </div>

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
        <div className={styles.infoTable}>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>住所</div>
            <div className={styles.infoValue}>{spot.address}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>営業時間</div>
            <div className={styles.infoValue}>{spot.businessHours || '情報なし'}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>電話番号</div>
            <div className={styles.infoValue}>{spot.phoneNumber || '情報なし'}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>定休日</div>
            <div className={styles.infoValue}>{spot.closedDays || "情報なし"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>支払方法</div>
            <div className={styles.infoValue}>{spot.paymentMethods || "情報なし"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>ウェブサイト</div>
            <div className={styles.infoValue}>
              {spot.websiteUrl ? (
                <a 
                  href={spot.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {spot.websiteUrl}
                </a>
              ) : (
                "情報なし"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Spots Section */}
      {typeof spot.latitude === 'number' && typeof spot.longitude === 'number' && !isNaN(spot.latitude) && !isNaN(spot.longitude) && (
        <NearbySpots 
          lat={spot.latitude} 
          lng={spot.longitude} 
          currentId={spot.id} 
        />
      )}

      {/* Action Footer */}
      <div className={styles.actionFooter}>
        <button className={btnStyles.routeBtn} style={{ flex: 1.5 }}>
          ルートを見る <ExternalLink size={18} />
        </button>
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

