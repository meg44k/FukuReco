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
  Sun,
  Moon,
} from "lucide-react";
import { Restaurant } from '@/types/spot'
import { Menu } from '@/types/menu'

import RecommendMenu from "@/components/atoms/recommendMenu/RecommendMenu";
import PhotoGallery from "@/components/atoms/photoGallery/PhotoGallery";
import GeneralMenus from "@/components/atoms/generalMenus/GeneralMenus"
import Tags from "@/components/atoms/tags/Tags";
import { useFavorites } from '@/hooks/useFavorites';
import { SpotDetailSkeleton } from '@/components/atoms/spotCard/SpotDetailSkeleton';
import NearbySpots from "@/components/organisms/nearbySpots/NearbySpots";

interface Props {
  params: Promise<{ id: string }>;
}

export default function RestaurantDetailPage({ params }: Props) {
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
        supabase.from('spots').select('*, restaurants(*)').eq('id', spotId).single(),
        supabase.from('menus').select('*').eq('spot_id', spotId),
        supabase.from('assets').select('*').eq('spot_id', spotId),
        supabase.from('spot_tags').select('tags(detail)').eq('spot_id', spotId)
      ]);

      const type = (spotRes.data.place_type || "").toLowerCase();
      if (spotRes.error || !spotRes.data || (type !== 'restaurant' && type !== 'cafe')) {
        setHasError(true);
        setLoading(false);
        return;
      }

      // restaurantsテーブルのデータを取り出す（1対1または1対多の配列を想定）
      const restaurantDetail = Array.isArray(spotRes.data.restaurants) 
        ? spotRes.data.restaurants[0] 
        : spotRes.data.restaurants;

      setSpotData({
        ...spotRes.data,
        ...restaurantDetail
      });
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

  if (loading || !spotData) {
    return <SpotDetailSkeleton />;
  }

  // Cast dynamic data to internal interfaces for property access
  const spot = spotData as unknown as {
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
    reservation_url?: string;
    remarks?: string;
    avg_lunch_budget?: string;
    avg_dinner_budget?: string;
    latitude: string;
    longitude: string;
  };

  const restaurant: Restaurant = {
    id: spot.id,
    name: spot.name,
    catchphrase: spot.catchphrase,
    distanceFromTransit: spot.distance_from_transit,
    stayDuration: spot.stay_duration,
    fukurekoComment: spot.fukureko_comment,
    address: spot.address,
    businessHours: spot.business_hours,
    phoneNumber: spot.phone_number,
    nearestStation: spot.nearest_station,
    websiteUrl: spot.website_url,
    averageBudget: spot.average_budget,
    placeType: spot.place_type,
    pricing: spot.pricing || {},
    facilities: spot.facilities || {},
    updatedAt: new Date(spot.updated_at),
    createdAt: new Date(spot.created_at),
    nearbyCoinLockers: spot.nearby_coin_lockers,
    parkingInfo: spot.parking_info,
    paymentMethods: spot.payment_methods,
    closedDays: spot.closed_days,
    reservationURL: spot.reservation_url,
    remarks: spot.remarks,
    avgLunchBudget: spot.avg_lunch_budget,
    avgDinnerBudget: spot.avg_dinner_budget,
    latitude: parseFloat(spot.latitude),
    longitude: parseFloat(spot.longitude),
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
  const generalMenus = menus.filter(m => !m.isRecommend);
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
        <p className={styles.catchphrase}>{restaurant.catchphrase}</p>
        <h1 className={styles.title}>{restaurant.name}</h1>
        <div className={styles.updatedAt}>
          更新日: {restaurant.updatedAt.toLocaleDateString('ja-JP')}
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
          <p className={styles.safetyValue}>{restaurant.nearestStation || '情報なし'}</p>
        </div>
        <div className={styles.safetyCard}>
          <p className={styles.safetyLabel}>空港・駅から（最短）</p>
          <p className={styles.safetyValue}>{restaurant.distanceFromTransit || '情報なし'}</p>
        </div>
        <div className={styles.safetyGrid}>
          <div className={styles.safetyCard}>
            <p className={styles.safetyLabel}>滞在目安</p>
            <p className={styles.safetyValue}>{restaurant.stayDuration || '情報なし'}</p>
          </div>
          <div className={styles.safetyCard}>
            <p className={styles.safetyLabel}>近くのコインロッカー</p>
            <p className={styles.safetyValue}>{restaurant.nearbyCoinLockers || '情報なし'}</p>
          </div>
        </div>
      </div>

      {/* Recommended Menu */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBar}></div>
          <h2 className={styles.sectionTitle}>おすすめメニュー</h2>
        </div>
        {recommendMenus.length > 0 ? (
          recommendMenus.map((menu, index) => <RecommendMenu key={index} recommendMenu={menu} />)
        ) : (
          <p className={styles.noData}>おすすめメニューはまだ登録されていません。</p>
        )}
      </div>

      {/* General Menu */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBar}></div>
          <h2 className={styles.sectionTitle}>メニュー</h2>
        </div>
        {generalMenus.length > 0 ? (
          <GeneralMenus GeneralMenus={generalMenus} />
        ) : (
          <p className={styles.noData}>メニューはまだ登録されていません。</p>
        )}
        <div className={styles.staffComment}>
          <p className={styles.commentText}>{restaurant.fukurekoComment}</p>
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
            <div className={styles.infoValue}>{restaurant.address}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>営業時間</div>
            <div className={styles.infoValue}>{restaurant.businessHours || '情報なし'}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>電話番号</div>
            <div className={styles.infoValue}>{restaurant.phoneNumber || '情報なし'}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>定休日</div>
            <div className={styles.infoValue}>{restaurant.closedDays || "情報なし"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>平均予算</div>
            <div className={styles.infoValue}>
              <div className={styles.budgetRow}>
                <span className={styles.budgetIcon} style={{ backgroundColor: "#efab58" }}>
                  <Sun />
                </span>
                <span>{restaurant.avgLunchBudget || restaurant.averageBudget || '情報なし'}</span>
              </div>
              <div className={styles.budgetRow}>
                <span className={styles.budgetIcon} style={{ backgroundColor: "#5C6BC0" }}>
                  <Moon />
                </span>
                <span>{restaurant.avgDinnerBudget || '情報なし'}</span>
              </div>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>支払方法</div>
            <div className={styles.infoValue}>{restaurant.paymentMethods || "情報なし"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>駐車場</div>
            <div className={styles.infoValue}>{restaurant.parkingInfo || "情報なし"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>ウェブサイト</div>
            <div className={styles.infoValue}>
              {restaurant.websiteUrl ? (
                <a 
                  href={restaurant.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {restaurant.websiteUrl}
                </a>
              ) : (
                "情報なし"
              )}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>備考</div>
            <div className={styles.infoValue}>{restaurant.remarks || "無し"}</div>
          </div>
        </div>
      </div>

      {/* Nearby Spots Section */}
      {typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number' && !isNaN(restaurant.latitude) && !isNaN(restaurant.longitude) && (
        <NearbySpots 
          lat={restaurant.latitude} 
          lng={restaurant.longitude} 
          currentId={restaurant.id} 
        />
      )}

      {/* Action Footer */}
      <div className={styles.actionFooter}>
        {restaurant.reservationURL ? (
          <a 
            href={restaurant.reservationURL}
            target="_blank"
            rel="noopener noreferrer"
            className={btnStyles.reserveBtn}
          >
            予約する
          </a>
        ) : restaurant.phoneNumber ? (
          <a 
            href={`tel:${restaurant.phoneNumber}`}
            className={btnStyles.reserveBtn}
          >
            電話する
          </a>
        ) : (
          <button className={btnStyles.reserveBtn} disabled>
            予約不可
          </button>
        )}
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}`}
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

