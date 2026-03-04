"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Map,
  GitFork,
  Heart,
  User,
  Search,
  SquareArrowOutUpRight
} from "lucide-react";

const RestaurantPage = () => {
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllMenu, setShowAllMenu] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const headerImages = [
    "/ramen.jpg",
    "/tonkotsu.jpg",
    "/ramen.jpg", // 仮の3枚目
  ];

  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % headerImages.length);
  };

  const prevImage = () => {
    setCurrentImgIndex((prev) => (prev - 1 + headerImages.length) % headerImages.length);
  };

  const tags = [
    "#おひとり様OK",
    "#大型荷物OK",
    "#ベビーカー可",
    "#駅近",
    "#深夜営業",
    "#カウンター席あり",
    "#スープがなくなり次第終了",
    "#クレジットカード可"
  ];

  const fullMenu = [
    { name: "なんとかAセット", desc: "ご飯おかわり無料！ボリューム満点", price: "¥1,200" },
    { name: "醤油ラーメン", desc: "定番のあっさり醤油味", price: "¥850" },
    { name: "塩ラーメン", desc: "素材の味を活かした透き通るスープ", price: "¥850" },
    { name: "特製つけ麺", desc: "濃厚な魚介豚骨スープと太麺", price: "¥1,050" },
    { name: "特製チャーハン", desc: "強火でパラパラに仕上げた絶品", price: "¥650" },
    { name: "一口餃子(6個)", desc: "パリッとジューシーな博多名物", price: "¥450" },
  ];

  const displayedTags = showAllTags ? tags : tags.slice(0, 3);

  return (
    <div className={styles.container}>
      {/* Header Carousel */}
      <div className={styles.header}>
        <div 
          className={styles.imageTrack} 
          style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
        >
          {headerImages.map((src, index) => (
            <div key={index} className={styles.imageContainer}>
              <Image
                src={src}
                alt={`Restaurant Image ${index + 1}`}
                fill
                className={styles.mainImage}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        <div className={styles.carouselNav}>
          <ChevronLeft size={32} onClick={prevImage} className={styles.navIcon} />
          <ChevronRight size={32} onClick={nextImage} className={styles.navIcon} />
        </div>
        <div className={styles.carouselIndicator}>
          {currentImgIndex + 1}/{headerImages.length}
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        <p className={styles.catchphrase}>博多駅から徒歩5分！一度は食べるべきラーメン</p>
        <h1 className={styles.title}>なんとかラーメン</h1>
        <div className={styles.chips}>
          {tags.slice(0, 3).map((tag, index) => (
            <Chip key={index} label={tag} variant="outlined" size="small" className={styles.chip} />
          ))}
          {!showAllTags && <div style={{ color: "#ccc", display: "flex", alignItems: "center" }}>...</div>}
        </div>
        <Collapse in={showAllTags}>
          <div className={styles.chips} style={{ marginTop: '8px' }}>
            {tags.slice(3).map((tag, index) => (
              <Chip key={index + 3} label={tag} variant="outlined" size="small" className={styles.chip} />
            ))}
          </div>
        </Collapse>
        <div 
          className={styles.showMoreTags} 
          onClick={() => setShowAllTags(!showAllTags)}
        >
          {showAllTags ? (
            <>タグを閉じる <ChevronUp size={16} /></>
          ) : (
            <>タグをすべてみる <ChevronDown size={16} /></>
          )}
        </div>
      </div>

      {/* Safety Info Section */}
      <div className={styles.safetySection}>
        <div className={styles.safetyTitle}>
          <Clock size={20} />
          <span>知っておくと安心！</span>
        </div>
        <div className={styles.safetyCard}>
          <p className={styles.safetyLabel}>空港・駅から（最短）</p>
          <p className={styles.safetyValue}>福岡空港から20分/博多駅から15分/天神駅から10分</p>
        </div>
        <div className={styles.safetyGrid}>
          <div className={styles.safetyCard}>
            <p className={styles.safetyLabel}>滞在目安</p>
            <p className={styles.safetyValue}>60分〜80分</p>
          </div>
          <div className={styles.safetyCard}>
            <p className={styles.safetyLabel}>近くのコインロッカー</p>
            <p className={`${styles.safetyValue} ${styles.link}`}>
              博多駅筑紫口 <SquareArrowOutUpRight size={14} style={{ display: 'inline' }} />
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Menu */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBar}></div>
          <h2 className={styles.sectionTitle}>おすすめメニュー</h2>
        </div>
        <div className={styles.recommendedItem}>
          <div className={styles.itemImage}></div>
          <div className={styles.itemInfo}>
            <p className={styles.itemName}>なんとかAセット</p>
            <p className={styles.itemDesc}>ご飯おかわり無料！ボリューム満点</p>
            <p className={styles.itemPrice}>¥1,200</p>
          </div>
        </div>
      </div>

      {/* Full Menu */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBar}></div>
          <h2 className={styles.sectionTitle}>全メニュー</h2>
        </div>
        <div className={styles.menuList}>
          {fullMenu.slice(0, 3).map((item, i) => (
            <div key={i} className={styles.menuItem}>
              <div className={styles.menuItemTop}>
                <p className={styles.itemName}>{item.name}</p>
                <div className={styles.dots}></div>
                <p className={styles.itemPrice}>{item.price}</p>
              </div>
              <p className={styles.itemDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
        <Collapse in={showAllMenu}>
          <div className={styles.menuList} style={{ marginTop: '1rem' }}>
            {fullMenu.slice(3).map((item, i) => (
              <div key={i + 3} className={styles.menuItem}>
                <div className={styles.menuItemTop}>
                  <p className={styles.itemName}>{item.name}</p>
                  <div className={styles.dots}></div>
                  <p className={styles.itemPrice}>{item.price}</p>
                </div>
                <p className={styles.itemDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </Collapse>
        <div 
          className={styles.showMoreMenu} 
          onClick={() => setShowAllMenu(!showAllMenu)}
        >
          {showAllMenu ? (
            <>メニューを閉じる <ChevronUp size={18} /></>
          ) : (
            <>メニューをすべてみる <ChevronDown size={18} /></>
          )}
        </div>
      </div>

      {/* Staff Comment */}
      <div className={styles.section}>
        <div className={styles.staffComment}>
          <p className={styles.commentText}>
            「SNSで話題の有名店は3時間待ちがザラですが、ここは同クオリティで15分ほどで入れる穴場です。13時半以降なら、さらにスムーズ。博多を離れる前の最後の一食に最適です！」
          </p>
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
            <div className={styles.infoValue}>
              北九州市 八幡西区 幸神 1-18-11
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>営業時間</div>
            <div className={styles.infoValue}>
              月・火・水・木・金<br />
              10:00 〜 15:00(L.O. 14:00)<br />
              18:00 〜 22:00(L.O. 21:00)<br /><br />
              土・日・祝<br />
              10:00 〜 15:00(L.O. 14:00)<br />
              18:00 〜 24:00(L.O. 23:00)
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>電話番号</div>
            <div className={styles.infoValue}>
              092-123-4567
            </div>
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

export default RestaurantPage;
