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
    // クローンを追加した画像リストを作成
    const extendedImages = headerImages.length > 1 
        ? [headerImages[headerImages.length - 1], ...headerImages, headerImages[0]]
        : headerImages;

    const [currentImgIndex, setCurrentImgIndex] = useState(headerImages.length > 1 ? 1 : 0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // スワイプの最小距離（px）
    const minSwipeDistance = 50;

    const nextImage = useCallback(() => {
        if (headerImages.length <= 1 || isTransitioning) return;
        setIsTransitioning(true);
        setCurrentImgIndex((prev) => prev + 1);
    }, [headerImages.length, isTransitioning]);

    const prevImage = useCallback(() => {
        if (headerImages.length <= 1 || isTransitioning) return;
        setIsTransitioning(true);
        setCurrentImgIndex((prev) => prev - 1);
    }, [headerImages.length, isTransitioning]);

    const handleTransitionEnd = () => {
        setIsTransitioning(false);
        if (headerImages.length <= 1) return;

        // クローンに到達した瞬間に、アニメーションなしで本物の位置へワープする
        if (currentImgIndex === 0) {
            // 先頭のクローン（最後の画像）にいる場合 -> 本物の最後へ
            setCurrentImgIndex(headerImages.length);
        } else if (currentImgIndex === headerImages.length + 1) {
            // 末尾のクローン（最初の画像）にいる場合 -> 本物の最初へ
            setCurrentImgIndex(1);
        }
    };

    // インジケーター用の現在のアクティブなインデックス
    const activeDotIndex = headerImages.length > 1 
        ? (currentImgIndex === 0 
            ? headerImages.length - 1 
            : currentImgIndex === headerImages.length + 1 
                ? 0 
                : currentImgIndex - 1)
        : 0;

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
        
        let start = Math.max(0, activeDotIndex - 2);
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
                    style={{ 
                        transform: `translateX(-${currentImgIndex * 100}%)`,
                        transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                {extendedImages.map((src, index) => (
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
                            priority={index === 1} // 本物の最初の画像にpriorityをつける
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
                        const isActive = index === activeDotIndex;
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
