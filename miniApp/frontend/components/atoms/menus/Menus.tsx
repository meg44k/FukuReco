"use client"
import { useState } from 'react';
import styles from './Menus.module.css'
import Collapse from "@mui/material/Collapse";
import {
    ChevronUp,
    ChevronDown,
} from "lucide-react"
export default function Menus(){
    const [showAllMenu, setShowAllMenu] = useState(false);
    const fullMenu = [
        { name: "なんとかAセット", desc: "ご飯おかわり無料！ボリューム満点", price: "¥1,200" },
        { name: "醤油ラーメン", desc: "定番のあっさり醤油味", price: "¥850" },
        { name: "塩ラーメン", desc: "素材の味を活かした透き通るスープ", price: "¥850" },
        { name: "特製つけ麺", desc: "濃厚な魚介豚骨スープと太麺", price: "¥1,050" },
        { name: "特製チャーハン", desc: "強火でパラパラに仕上げた絶品", price: "¥650" },
        { name: "一口餃子(6個)", desc: "パリッとジューシーな博多名物", price: "¥450" },
    ];


    return (
        <div className={styles.section}>
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


    )
}