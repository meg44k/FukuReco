"use client"
import { useState } from 'react';
import styles from './GeneralMenus.module.css'
import Collapse from "@mui/material/Collapse";
import {
    ChevronUp,
    ChevronDown,
} from "lucide-react"
import { Menu } from '@/types/menu'
import Image from 'next/image'
import { Price } from '../price/Price';

type GeneralMenusProps = {
  GeneralMenus: Menu[];
}

const MenuItem = ({ item }: { item: Menu }) => {
  const hasImage = !!item.assetId;
  const isHttp = typeof item.assetId === 'string' && item.assetId.startsWith('http');

  return (
    <div className={styles.menuItem}>
      {hasImage && (
        <div className={styles.itemImage}>
          <Image 
            src={item.assetId!} 
            alt={item.name} 
            fill 
            style={{ objectFit: 'cover' }} 
            unoptimized={isHttp}
          />
        </div>
      )}
      <div className={styles.menuItemContent}>
        <div className={styles.menuItemTop}>
          <p className={styles.itemName}>{item.name}</p>
          <div className={styles.dots}></div>
          <Price price={item.price} />
        </div>
        <p className={styles.itemDesc}>{item.detail}</p>
      </div>
    </div>
  );
};

export default function GeneralMenus({GeneralMenus}: GeneralMenusProps){
    const [showAllMenu, setShowAllMenu] = useState(false);
    return (
        <div className={styles.section}>
          <div className={styles.menuList}>
            {GeneralMenus.slice(0, 3).map((item, i) => (
              <MenuItem key={i} item={item} />
            ))}
          </div>
          <Collapse in={showAllMenu}>
            <div className={styles.menuList} style={{ marginTop: '1rem' }}>
              {GeneralMenus.slice(3).map((item, i) => (
                <MenuItem key={i + 3} item={item} />
              ))}
            </div>
          </Collapse>
          <div 
            className={styles.showMoreMenu} 
            onClick={() => setShowAllMenu(!showAllMenu)}
          >
            {showAllMenu ? (
              <>メニューを閉じる <ChevronUp size={18} color="#3F7D58" style={{ transform: 'translateY(2px)' }} /></>
            ) : (
              <>メニューをすべてみる <ChevronDown size={18} color="#3F7D58" style={{ transform: 'translateY(2px)' }} /></>
            )}
          </div>
        </div>
    )
}
