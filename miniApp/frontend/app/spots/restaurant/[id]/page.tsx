"use client"
import { createClient } from '@/lib/supabase/client';
import { notFound, useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import styles from '../page.module.css'; 
import {
  Clock,
  ExternalLink,
  Heart,
  ChevronLeft,
  X,
} from "lucide-react";
import { Restaurant, Spot } from '@/types/spot'
import { Menu } from '@/types/menu'

import RecommendMenu from "@/components/atoms/recommendMenu/RecommendMenu";
import PhotoGallery from "@/components/atoms/photoGallery/PhotoGallery";
import GeneralMenus from "@/components/atoms/generalMenus/GeneralMenus"
import Tags from "@/components/atoms/tags/Tags";

interface Props {
  params: Promise<{ id: string }>;
}

export default function RestaurantDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [spotData, setSpotData] = useState<any>(null);
  const [menuData, setMenuData] = useState<any[]>([]);
  const [assetData, setAssetData] = useState<any[]>([]);
  const [tagData, setTagData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

      if (spotRes.error || !spotRes.data || spotRes.data.place_type !== 'restaurant') {
        setHasError(true);
        setLoading(false);
        return;
      }

      setSpotData(spotRes.data);
      setMenuData(menuRes.data || []);
      setAssetData(assetRes.data || []);

      const tags = (tagRes.data as any[])?.map((item: any) => item.tags?.detail).filter(Boolean) || [];
      setTagData(tags);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // 50px以上スクロールしていて、かつ下にスクロールしている場合は隠す
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

  if (loading) return null;

  const restaurant: Restaurant = {
    id: spotData.id,
    name: spotData.name,
    catchphrase: spotData.catchphrase,
    distanceFromTransit: spotData.distance_from_transit,
    stayDuration: spotData.stay_duration,
    fukurekoComment: spotData.fukureko_comment,
    address: spotData.address,
    businessHours: spotData.business_hours,
    phoneNumber: spotData.phone_number,
    nearestStation: spotData.nearest_station,
    websiteUrl: spotData.website_url,
    averageBudget: spotData.average_budget,
    placeType: spotData.place_type,
    pricing: spotData.pricing || {},
    facilities: spotData.facilities || {},
    updatedAt: new Date(spotData.updated_at),
    createdAt: new Date(spotData.created_at),
    nearbyCoinLockers: spotData.nearby_coin_lockers,
    parkingInfo: spotData.parking_info,
    paymentMethods: spotData.payment_methods,
    closedDays: spotData.closed_days,
    reservationURL: spotData.reservation_url,
  };

  const assetMap = assetData.reduce((acc, asset) => {
    acc[asset.id] = asset.url;
    return acc;
  }, {} as Record<number, string>);

  const menus: Menu[] = menuData.map(m => ({
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
    ? assetData
        .filter((a: any) => a.is_photo_gallery === true)
        .sort((a: any, b: any) => (a.gallery_order ?? Infinity) - (b.gallery_order ?? Infinity))
        .map((a: any) => a.url || a.URL)
    : [];

  const handleAction = () => {
    if (restaurant.reservationURL) {
      window.open(restaurant.reservationURL, '_blank', 'noopener,noreferrer');
    } else if (restaurant.phoneNumber) {
      window.location.href = `tel:${restaurant.phoneNumber}`;
    }
  };

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
            <div className={styles.infoValue}>{restaurant.averageBudget || "情報なし"}</div>
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

      {/* Action Footer */}
      <div className={styles.actionFooter}>
        {restaurant.reservationURL ? (
          <a 
            href={restaurant.reservationURL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.reserveBtn}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            予約する
          </a>
        ) : restaurant.phoneNumber ? (
          <a 
            href={`tel:${restaurant.phoneNumber}`}
            className={styles.reserveBtn}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            電話する
          </a>
        ) : (
          <button className={styles.reserveBtn} disabled>
            予約不可
          </button>
        )}
        <button className={styles.routeBtn}>
          ルートを見る <ExternalLink size={18} />
        </button>
        <button className={styles.heartBtn}>
          <Heart size={24} />
        </button>
      </div>
    </div>
  );
}
