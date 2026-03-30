import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import styles from '../page.module.css'; // 親ディレクトリのスタイルを流用
import {
  Clock,
  ExternalLink,
  Heart
} from "lucide-react";
import { Spot } from '@/types/spot'
import { Menu } from '@/types/menu'

import RecommendMenu from "@/components/atoms/recommendMenu/RecommendMenu";
import PhotoGallery from "@/components/atoms/photoGallery/PhotoGallery";
import GeneralMenus from "@/components/atoms/generalMenus/GeneralMenus"
import Tags from "@/components/atoms/tags/Tags";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // IDが数値の場合は数値として扱う（PostgRESTの型不一致エラー回避のため）
  const spotId = !isNaN(Number(id)) ? Number(id) : id;

  // 1. スポットデータの取得
  const { data: spotData, error: spotError } = await supabase
    .from('spots')
    .select('*')
    .eq('id', spotId)
    .single();

  if (spotError || !spotData) {
    notFound();
  }

  // 2. メニューデータの取得
  const { data: menuData, error: menuError } = await supabase
    .from('menus')
    .select('*')
    .eq('spot_id', spotId);

  // 3. アセット（画像）の取得
  const { data: assetData, error: assetError } = await supabase
    .from('assets')
    .select('*')
    .eq('spot_id', spotId);

  // DBのカラム名（スネークケース）から型定義（キャメルケース）へのマッピング
  // ※ 型定義に合わせた変換をここで行います
  const restaurant: Spot = {
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
    closedDays: spotData.closed_days
  };

  // メニューの整理
  // アセットIDからURLへのマップを作成
  const assetMap = (assetData || []).reduce((acc, asset) => {
    acc[asset.id] = asset.url;
    return acc;
  }, {} as Record<number, string>);

  const menus: Menu[] = (menuData || []).map(m => ({
    spotId: m.spot_id,
    name: m.name,
    price: m.price,
    detail: m.detail,
    assetId: m.asset_id ? assetMap[m.asset_id] : undefined, // IDをURLに変換
    isRecommend: m.is_recommend
  }));

  const recommendMenus = menus.filter(m => m.isRecommend);
  const generalMenus = menus.filter(m => !m.isRecommend);
  
  // フォトギャラリー用の画像リスト
  const photoUrls = assetData?.map(a => a.url) || [];

  return (
    <div className={styles.container}>
      {/* Header Carousel */}
      <div className={styles.header}>
        <PhotoGallery images={photoUrls} />
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        <p className={styles.catchphrase}>{restaurant.catchphrase}</p>
        <h1 className={styles.title}>{restaurant.name}</h1>
        <Tags />
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
            <p className={`${styles.safetyValue} ${styles.link}`}>{restaurant.nearbyCoinLockers || '情報なし'}</p>
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
          <p className={styles.commentAuthor}>— FukuReco運営スタッフ</p>
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
            <div className={styles.infoValue}>{restaurant.websiteUrl || "情報なし"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>備考</div>
            <div className={styles.infoValue}>{restaurant.remarks || "無し"}</div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className={styles.actionFooter}>
        <button className={styles.reserveBtn}>予約する</button>
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
