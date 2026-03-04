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
  Heart,
  SquareArrowOutUpRight
} from "lucide-react";

const SightseeingPage = () => {
  const [showAllTags, setShowAllTags] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const headerImages = [
    "/ramen.jpg", // Using existing placeholder images
    "/tonkotsu.jpg",
    "/ramen.jpg",
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
    "#散策に最適",
    "#写真映え",
    "#ペット可",
    "#バリアフリー",
    "#駐車場あり"
  ];

  const recommendedPoints = [
    {
      id: 1,
      title: "① なんとかからの夕暮れ",
      desc: "17時からのライトアップがSNS映えの鉄板です"
    },
    {
      id: 2,
      title: "② なんとかからの夕暮れ",
      desc: "17時からのライトアップがSNS映えの鉄板です"
    }
  ];

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
                alt={`Sightseeing Image ${index + 1}`}
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
        <p className={styles.catchphrase}>都会の喧騒を忘れ、リラックスできる</p>
        <h1 className={styles.title}>大濠公園</h1>
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
            <p className={styles.safetyValue}>30分〜</p>
          </div>
          <div className={styles.safetyCard}>
            <p className={styles.safetyLabel}>近くのコインロッカー</p>
            <p className={styles.safetyValue}>
              博多駅筑紫口 <SquareArrowOutUpRight size={14} style={{ display: 'inline' }} />
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Points */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBar}></div>
          <h2 className={styles.sectionTitle}>おすすめポイント</h2>
        </div>
        {recommendedPoints.map((point) => (
          <div key={point.id} className={styles.recommendedItem}>
            <div className={styles.pointImage}></div>
            <div className={styles.pointInfo}>
              <p className={styles.pointTitle}>{point.title}</p>
              <p className={styles.pointDesc}>{point.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Comment */}
      <div className={styles.section}>
        <div className={styles.staffComment}>
          <p className={styles.commentText}>
            「SNSで話題の有名店は2時間待ちがザラですが、ここは同クオリティで15分ほどで入れる穴場です。13時半以降なら、さらにスムーズ。博多を離れる前の最後の一食に最適です！」
          </p>
          <p className={styles.commentAuthor}>— FukuReco運営スタッフ</p>
        </div>
      </div>

      {/* Fees Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBar}></div>
          <h2 className={styles.sectionTitle}>料金</h2>
        </div>
        <div className={styles.feeBox}></div>
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

export default SightseeingPage;
