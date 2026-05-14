"use client"
import { useState, useCallback, useRef, useEffect } from "react";
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
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // クローンを追加した画像リストを作成
    const extendedImages = headerImages.length > 1 
        ? [headerImages[headerImages.length - 1], ...headerImages, headerImages[0]]
        : headerImages;

    const [currentImgIndex, setCurrentImgIndex] = useState(headerImages.length > 1 ? 1 : 0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // ドラッグ管理用のRef (レンダリングをトリガーしない)
    const dragInfo = useRef({
        isDragging: false,
        touchStart: 0,
        dragOffset: 0,
        rafId: 0
    });

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    // インデックスや幅、アニメーション状態が変わったときに位置を更新する
    useEffect(() => {
        if (trackRef.current && containerWidth > 0) {
            // ドラッグ中でないときのみ位置を同期する
            if (!dragInfo.current.isDragging) {
                // アニメーション中ならtransitionを設定、そうでなければ即時反映（ワープ用）
                trackRef.current.style.transition = isTransitioning ? 'transform 0.3s ease-out' : 'none';
                trackRef.current.style.transform = `translateX(-${currentImgIndex * 100}%)`;
            }
        }
    }, [currentImgIndex, containerWidth, isTransitioning]);

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
            setCurrentImgIndex(headerImages.length);
        } else if (currentImgIndex === headerImages.length + 1) {
            setCurrentImgIndex(1);
        }
    };

    const onTouchStart = (e: React.TouchEvent) => {
        if (isTransitioning || headerImages.length <= 1) return;
        e.stopPropagation();
        dragInfo.current.isDragging = true;
        dragInfo.current.touchStart = e.targetTouches[0].clientX;
        dragInfo.current.dragOffset = 0;
        
        if (trackRef.current) {
            trackRef.current.style.transition = 'none';
        }
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!dragInfo.current.isDragging) return;
        e.stopPropagation();
        
        const currentX = e.targetTouches[0].clientX;
        dragInfo.current.dragOffset = currentX - dragInfo.current.touchStart;

        // requestAnimationFrameで描画を最適化
        cancelAnimationFrame(dragInfo.current.rafId);
        dragInfo.current.rafId = requestAnimationFrame(() => {
            if (trackRef.current && containerWidth > 0) {
                const baseTranslate = -currentImgIndex * 100;
                const dragTranslate = (dragInfo.current.dragOffset / containerWidth) * 100;
                trackRef.current.style.transform = `translateX(${baseTranslate + dragTranslate}%)`;
            }
        });
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!dragInfo.current.isDragging) return;
        e.stopPropagation();
        
        dragInfo.current.isDragging = false;
        cancelAnimationFrame(dragInfo.current.rafId);

        const threshold = containerWidth * 0.2;
        const offset = dragInfo.current.dragOffset;

        if (offset < -threshold) {
            nextImage();
        } else if (offset > threshold) {
            prevImage();
        } else {
            // スナップバック (indexは変わらないがアニメーションをトリガーする)
            setIsTransitioning(true);
            // indexが変わらない場合でもuseEffectを走らせるために、
            // もし既にfalseなら一度trueにすることで再描画を促す
        }
    };

    // インジケーター用
    const activeDotIndex = headerImages.length > 1 
        ? (currentImgIndex === 0 
            ? headerImages.length - 1 
            : currentImgIndex === headerImages.length + 1 
                ? 0 
                : currentImgIndex - 1)
        : 0;

    const isVideo = (url: string) => {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

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

    if (headerImages.length === 0) return null;

    return(
        <div className={styles.header}>
            <div 
                ref={containerRef}
                className={styles.galleryContainer}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div 
                    ref={trackRef}
                    className={styles.imageTrack} 
                    onTransitionEnd={handleTransitionEnd}
                >
                {extendedImages.map((src, index) => (
                    <div key={index} className={styles.imageContainer}>
                    {isVideo(src) ? (
                        <video src={src} className={styles.mainVideo} autoPlay muted loop playsInline />
                    ) : (
                        <Image
                            src={src}
                            alt={`Spot Media ${index}`}
                            fill
                            className={styles.mainImage}
                            priority={index === 1}
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
                    <div className={styles.carouselIndicator} role="group" aria-label="画像スライダーの進捗">
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

