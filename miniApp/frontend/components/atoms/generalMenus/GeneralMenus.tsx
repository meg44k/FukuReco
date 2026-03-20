"use client"
import { useState } from 'react';
import styles from './GeneralMenus.module.css'
import Collapse from "@mui/material/Collapse";
import {
    ChevronUp,
    ChevronDown,
} from "lucide-react"
import { Menu } from '@/types/menu'

type GeneralMenusProps = {
  GeneralMenus: Menu[];
}

export default function GeneralMenus({GeneralMenus}: GeneralMenusProps){
    const [showAllMenu, setShowAllMenu] = useState(false);
    return (
        <div className={styles.section}>
       <div className={styles.menuList}>
          {GeneralMenus.slice(0, 3).map((item, i) => (
            <div key={i} className={styles.menuItem}>
              <div className={styles.menuItemTop}>
                <p className={styles.itemName}>{item.name}</p>
                <div className={styles.dots}></div>
                <p className={styles.itemPrice}>¥{item.price}</p>
              </div>
              <p className={styles.itemDesc}>{item.detail}</p>
            </div>
          ))}
        </div>
        <Collapse in={showAllMenu}>
          <div className={styles.menuList} style={{ marginTop: '1rem' }}>
            {GeneralMenus.slice(3).map((item, i) => (
              <div key={i + 3} className={styles.menuItem}>
                <div className={styles.menuItemTop}>
                  <p className={styles.itemName}>{item.name}</p>
                  <div className={styles.dots}></div>
                  <p className={styles.itemPrice}>¥{item.price}</p>
                </div>
                <p className={styles.itemDesc}>{item.detail}</p>
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


    )
}