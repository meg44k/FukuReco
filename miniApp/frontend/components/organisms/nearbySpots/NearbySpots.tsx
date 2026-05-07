"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './NearbySpots.module.css';

interface NearbySpot {
  id: number;
  spotKind: string;
  spotName: string;
  imageSrc: string;
  spotTags: string[];
  detailURL: string;
}

interface Props {
  lat: number;
  lng: number;
  currentId: number;
}

export default function NearbySpots({ lat, lng, currentId }: Props) {
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        setError(false);
        const res = await fetch(`/api/spots/nearby?lat=${lat}&lng=${lng}&currentId=${currentId}`);
        if (res.ok) {
          const data = await res.json();
          setSpots(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch nearby spots:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      fetchNearby();
    } else {
      setLoading(false);
    }
  }, [lat, lng, currentId]);

  if (loading) {
    return null;
  }

  // エラーもなく、スポットも0件の場合はセクションごと非表示
  if (!error && spots.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.bar}></div>
        <h2 className={styles.title}>周辺のスポット</h2>
      </div>

      {error ? (
        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#888' }}>周辺スポットの取得に失敗しました。</div>
      ) : (
        <div className={styles.scrollContainer}>
          {spots.map((spot) => (
            <Link href={spot.detailURL} key={spot.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image 
                  src={spot.imageSrc} 
                  alt={spot.spotName} 
                  fill 
                  style={{ objectFit: 'cover' }}
                  sizes="160px"
                />
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.spotName}>{spot.spotName}</h3>
                <div className={styles.tags}>
                  {spot.spotTags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className={styles.tag}>#{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
