"use client";

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Spot } from '@/types/spot';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteButton from '@/components/atoms/favoriteButton/FavoriteButton';
import styles from './SpotActionFooter.module.css';
import btnStyles from '@/styles/common-buttons.module.css';

interface SpotActionFooterProps {
  spot: Spot;
  showReservation?: boolean;
}

const SpotActionFooter: React.FC<SpotActionFooterProps> = ({ 
  spot, 
  showReservation = false 
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const id = spot.id;

  return (
    <div className={styles.actionFooter}>
      {showReservation && (
        <>
          {spot.reservationURL ? (
            <a 
              href={spot.reservationURL}
              target="_blank"
              rel="noopener noreferrer"
              className={btnStyles.reserveBtn}
            >
              予約する
            </a>
          ) : spot.phoneNumber ? (
            <a 
              href={`tel:${spot.phoneNumber}`}
              className={btnStyles.reserveBtn}
            >
              電話する
            </a>
          ) : (
            <button className={btnStyles.reserveBtn} disabled>
              予約不可
            </button>
          )}
        </>
      )}
      
      <a 
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${spot.name} ${spot.address}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnStyles.routeBtn}
        style={{ flex: showReservation ? 1.5 : 1 }}
      >
        ルートを見る <ExternalLink size={18} />
      </a>
      
      <FavoriteButton 
        isFavorite={isFavorite(id)} 
        onClick={() => toggleFavorite(id)} 
        className={btnStyles.favoriteBtn}
      />
    </div>
  );
};

export default SpotActionFooter;
