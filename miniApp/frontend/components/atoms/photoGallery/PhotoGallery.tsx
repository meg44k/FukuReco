"use client"
import { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./PhotoGallery.module.css";
import Image from "next/image";
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

interface PhotoGalleryProps {
    images?: string[];
}

export default function PhotoGallery ({ images = [] }: PhotoGalleryProps) {
    const headerImages = useMemo(() => {
        return images && images.length > 0 ? images : [
            "/ramen.jpg",
            "/tonkotsu.jpg",
            "/ramen.jpg", // 仮の3枚目
        ];
    }, [images]);

    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // 画像リストが変わった際にインデックスをリセットする
    useEffect(() => {
        setCurrentImgIndex(0);
    }, [headerImages]);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // スワイプの最小距離（px）
    const minSwipeDistance = 50;

    const nextImage = useCallback(() => {
        if (headerImages.length <= 1) return;
        setCurrentImgIndex((prev) => (prev + 1) % headerImages.length);
    }, [headerImages.length]);

    const prevImage = useCallback(() => {
        if (headerImages.length <= 1) return;
        setCurrentImgIndex((prev) => (prev - 1 + headerImages.length) % headerImages.length);
    }, [headerImages.length]);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextImage();
        } else if (isRightSwipe) {
            prevImage();
        }
    };

    const isVideo = (url: string) => {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    // 自動スライドの設定
    useEffect(() => {
        if (headerImages.length <= 1) return;

        const interval = setInterval(() => {
            nextImage();
        }, 5000); // 5秒ごとにスライド

        return () => clearInterval(interval);
    }, [nextImage, headerImages.length]);

    return(
        <div 
            className={styles.galleryContainer}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div 
          className={styles.imageTrack} 
          style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
        >
          {headerImages.map((src, index) => (
            <div key={index} className={styles.imageContainer}>
              {isVideo(src) ? (
                  <video 
                    src={src} 
                    className={styles.mainVideo} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                  />
              ) : (
                <Image
                    src={src}
                    alt={`Restaurant Media ${index}`}
                    fill
                    className={styles.mainImage}
                    priority={index === 0}
                    unoptimized={src.startsWith('http')}
                />
              )}
            </div>
          ))}
        </div>
        {headerImages.length > 1 && (
          <>
            <div className={styles.carouselNav}>
              <ChevronLeft size={32} onClick={prevImage} className={styles.navIcon} />
              <ChevronRight size={32} onClick={nextImage} className={styles.navIcon} />
            </div>
            <div className={styles.carouselIndicator}>
              {currentImgIndex + 1}/{headerImages.length}
            </div>
          </>
        )}
        </div>
    )
}
