"use client";
import Image from "next/image";
import styles from "./spots.module.css";

import {RatingBar} from "@/components/atoms/ratingBar/RatingBar";

import Chip from "@mui/material/Chip"
import{ 
  Heart,
  MapPin,
  Footprints,
} from "lucide-react";

const SpotPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.mainImageContainer}>
        <Image
          src="/ramen.jpg" // Assuming the main image is in public/ramen.jpg
          alt="Ramen"
          width={500}
          height={300}
          className={styles.mainImage}
        />
      </div>
      <div className={styles.content}>
        <p className={styles.catchphrase}>博多駅から徒歩5分！一度は食べるべきラーメン</p>
        <h1 className={styles.title}>なんとかラーメン</h1>
        <div className={styles.chips}>
          <Chip label="# 1,000" variant="outlined" size="small"/>
          <Chip label="# 天神" variant="outlined" size="small"/>
          <Chip label="# 博多駅から徒歩3分" variant="outlined" size="small"/>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>お店のコメント</h2>
          <p>
            厳選された鶏ガラと豚骨を20時間以上炊き出し、素材の旨味を凝縮させた特製濃厚スープ。そこに合わせるのは、スープの持ち上げにこだわった自家製の加水細麺です。
            一口啜れば、口いっぱいに広がる芳醇な香りと、ガツンとくるコクが癖になります。低温調理で仕上げたしっとりチャーシューも自慢の逸品。
            日常の喧騒を忘れ、最高の一杯に集中できる空間をご用意しております。ぜひ一度、ご賞味ください。
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>編集部の評価</h2>
          <p className={styles.evaluationHighlight}>究極の一杯、ここに極まる。</p>
          <p>
            特筆すべきは、重厚ながらも後味が驚くほどクリアなスープの設計。雑味が一切なく、最後まで飲み干せるバランスの良さは圧巻の一言です。また、トッピング一つひとつのクオリティが高く、特にチャーシューの質感は他の追随を許しません。
            味、接客、空間演出のすべてにおいて高いレベルでまとまっており、ラーメン激戦区においても「今、絶対に行くべき一軒」として自信を持って太鼓判を押します。
          </p>
        </div>

      <RatingBar title="￥価格帯" leftLabel="お手軽" rightLabel="高級" rate={4} />

        <div className={styles.section}>
          
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>おすすめメニュー</h2>
          <div className={styles.menuGrid}>
            <div className={styles.menuItem}>
              <Image
                src="/tonkotsu.jpg" // Assuming this image is in public/tonkotsu.jpg
                alt="豚骨ラーメン"
                width={150}
                height={100}
                className={styles.menuImage}
              />
              <p>豚骨ラーメン</p>
              <p>¥990</p>
              <span className={styles.badge}>店長おすすめ!</span>
            </div>
            <div className={styles.menuItem}>
              <Image
                src="/tonkotsu.jpg"
                alt="豚骨ラーメン"
                width={150}
                height={100}
                className={styles.menuImage}
              />
              <p>豚骨ラーメン</p>
              <p>¥990</p>
              <span className={styles.badge}>編集部おすすめ!</span>
            </div>
            <div className={styles.menuItem}>
              <Image
                src="/tonkotsu.jpg"
                alt="豚骨ラーメン"
                width={150}
                height={100}
                className={styles.menuImage}
              />
              <p>豚骨ラーメン</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>基本情報</h2>
          <div className={styles.infoTable}>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>住所</div>
              <div className={styles.infoValue}>
                北九州市八幡西区幸神1-18-11
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>営業時間</div>
              <div className={styles.infoValue}>
                <p>月・火・水・木・金</p>
                <p>10:00 ~ 15:00 (L.O. 14:00)</p>
                <p>18:00 ~ 22:00 (L.O. 21:00)</p>
                <p>土・日・祝</p>
                <p>10:00 ~ 15:00 (L.O. 14:00)</p>
                <p>18:00 ~ 24:00 (L.O. 23:00)</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button className={`${styles.button} ${styles.primary}`}>
            予約する
          </button>
          <button className={`${styles.button} ${styles.secondary}`}>
            ルートを見る
          </button>
          <button className={styles.iconButton}>
            <Heart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpotPage;
