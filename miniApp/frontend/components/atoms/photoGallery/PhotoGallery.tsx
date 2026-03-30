"use client"
import { useState } from "react";
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
    const headerImages = images.length > 0 ? images : [
        "/ramen.jpg",
        "/tonkotsu.jpg",
        "/ramen.jpg", // 仮の3枚目
    ];

    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const nextImage = () => {
        if (headerImages.length <= 1) return;
        setCurrentImgIndex((prev) => (prev + 1) % headerImages.length);
    };

    const prevImage = () => {
        if (headerImages.length <= 1) return;
        setCurrentImgIndex((prev) => (prev - 1 + headerImages.length) % headerImages.length);
    };

    return(
        <div className={styles.galleryContainer}>
            <div 
          className={styles.imageTrack} 
          style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
        >
          {headerImages.map((src, index) => (
            <div key={index} className={styles.imageContainer}>
              <Image
                src={src}
                alt={`Restaurant Image ${index}`}
                fill
                className={styles.mainImage}
                priority={index === 0}
                unoptimized={src.startsWith('http')} // Supabase Storageなどの外部URLの場合はunoptimizedにするか、next.configでドメイン許可が必要
              />
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
