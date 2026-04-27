"use client"
import { useState, useCallback } from "react";
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
    const headerImages = images || [];
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
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

    // 表示するドットの範囲を計算（最大5個）
    const getVisibleDotIndices = () => {
        const maxVisible = 5;
        if (headerImages.length <= maxVisible) return headerImages.map((_, i) => i);
        
        let start = Math.max(0, currentImgIndex - 2);
        if (start + maxVisible > headerImages.length) {
            start = headerImages.length - maxVisible;
        }
        return Array.from({ length: maxVisible }, (_, i) => start + i);
    };

    const visibleDotIndices = getVisibleDotIndices();

    if (headerImages.length === 0) {
        return null;
    }

    return(
        <div className={styles.header}>
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
                            alt={`Spot Media ${index}`}
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
                    <ChevronLeft size={32} onClick={prevImage} className={styles.navIcon} aria-label="前の画像へ" />
                    <ChevronRight size={32} onClick={nextImage} className={styles.navIcon} aria-label="次の画像へ" />
                    </div>
                    <div 
                        className={styles.carouselIndicator} 
                        role="group" 
                        aria-label="画像スライダーの進捗"
                    >
                    {visibleDotIndices.map((index, idx) => {
                        const isActive = index === currentImgIndex;
                        const isFirst = idx === 0;
                        const isLast = idx === visibleDotIndices.length - 1;
                        const hasMorePrev = isFirst && index > 0;
                        const hasMoreNext = isLast && index < headerImages.length - 1;

                        return (
                            <div 
                                key={index} 
                                className={`
                                    ${styles.dot} 
                                    ${isActive ? styles.activeDot : ""} 
                                    ${hasMorePrev || hasMoreNext ? styles.smallDot : ""}
                                `}
                                aria-current={isActive ? "true" : "false"}
                            />
                        );
                    })}
                    </div>
                </>
                )}
            </div>
        </div>
    )
}
