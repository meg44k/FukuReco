"use client";

import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: () => void;
  size?: number;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  isFavorite, 
  onClick, 
  size = 24,
  className = ""
}) => {
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimate) {
      timer = setTimeout(() => setIsAnimate(false), 600);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAnimate]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // お気に入りに追加されるとき（現在は未登録のとき）にアニメーションを実行
    if (!isFavorite) {
      setIsAnimate(true);
    }
    onClick();
  };

  return (
    <button 
      className={`${styles.favoriteButton} ${isAnimate ? styles.animate : ''} ${className}`}
      onClick={handleClick}
      aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <div className={styles.favoriteWrapper}>
        <div className={styles.burstContainer}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.particle} />
          ))}
        </div>
        <div className={styles.iconWrapper}>
          <Bookmark 
            size={size} 
            className={isFavorite ? styles.iconActive : styles.iconInactive}
          />
        </div>
      </div>
    </button>
  );
};

export default FavoriteButton;

