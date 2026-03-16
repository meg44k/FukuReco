import styles from "./page.module.css";
import {
  Clock,
  ExternalLink,
  Heart,
  SquareArrowOutUpRight
} from "lucide-react";
import { Spot } from '@/types/spot'
import { Menu } from '@/types/menu'

import RecommendMenu from "@/components/atoms/recommendMenu/RecommendMenu";
import PhotoGallery from "@/components/atoms/photoGallery/PhotoGallery";
import Menus from "@/components/atoms/menus/Menus"
import Tags from "@/components/atoms/tags/Tags";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_SUPABASE_URL

async function getRestaurantData(){
  const res = await fetch(BACKEND_ENDPOINT+'/api/spots/restaurant', {cache: 'no-store'});
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json()
}  

async function getMenuData(){
  // TODO: SpotIDからMenuを取ってくるようにする
  const res = await fetch(BACKEND_ENDPOINT+'/api/menu', {cache: 'no-store'});
  if (!res.ok) throw new Error('Faliled to fetch data');
  return res.json();
}

export default async function RestaurantPage () {
  const restaurantData: Spot = await getRestaurantData();
  const menuData: Menu[] = await getMenuData();
  const recommendMenus: Menu[] = [];
  for(const menu of menuData){
    if (menu.isRecommend)
      recommendMenus.push(menu)
  }
  
  return (
    <div className={styles.container}>
      {/* Header Carousel */}
      <div className={styles.header}>
        <PhotoGallery/>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        <p className={styles.catchphrase}>{restaurantData.catchphrase}</p>
        <h1 className={styles.title}>{restaurantData.name}</h1>
        <Tags/>
      </div>

      {/* Safety Info Section */}
      <div className={styles.safetySection}>
        <div className={styles.safetyTitle}>
          <Clock size={20} />
          <span>知っておくと安心！</span>
        </div>
        <div className={styles.safetyCard}>
          <p className={styles.safetyLabel}>空港・駅から（最短）</p>
          <p className={styles.safetyValue}>{restaurantData.distanceFromTransit}</p>
        </div>
        <div className={styles.safetyGrid}>
          <div className={styles.safetyCard}>
            <p className={styles.safetyLabel}>滞在目安</p>
            <p className={styles.safetyValue}>{restaurantData.stayDuration}</p>
          </div>
          <div className={styles.safetyCard}>
            <p className={styles.safetyLabel}>近くのコインロッカー</p>
            <p className={`${styles.safetyValue} ${styles.link}`}>{restaurantData.nearbyCoinLockers}</p>
          </div>
        </div>
      </div>

      {/* Recommended Menu */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBar}></div>
          <h2 className={styles.sectionTitle}>おすすめメニュー</h2>
        </div>
       {/* ここにrecommendItems */}
        {recommendMenus.map((recommendMenu,index)=>(<RecommendMenu key={index} recommendMenu={recommendMenu}/>))}
        
       </div>

      {/* Full Menu */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBar}></div>
          <h2 className={styles.sectionTitle}>全メニュー</h2>
        </div>
        <Menus/>
        <div className={styles.staffComment}>
          <p className={styles.commentText}>{restaurantData.fukurekoComment}</p>
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
            <div className={styles.infoValue}>{restaurantData.address}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>営業時間</div>
            <div className={styles.infoValue}>{restaurantData.businessHours}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>電話番号</div>
            <div className={styles.infoValue}>{restaurantData.phoneNumber}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>定休日</div>
            <div className={styles.infoValue}>
              不定休（年始を除く）
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>席情報</div>
            <div className={styles.infoValue}>
              カウンター 10席 / テーブル 20席
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Spots */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} ${styles.primaryText}`}>近くのスポット情報</h2>
        </div>
        <div className={styles.nearbyScroll}>
          <div className={styles.nearbyItem}></div>
          <div className={styles.nearbyItem}></div>
          <div className={styles.nearbyItem}></div>
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
};

