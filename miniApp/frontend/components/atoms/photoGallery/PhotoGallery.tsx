"use client"
import { useState } from "react";
import styles from "./PhotoGallery.module.css";
import Image from "next/image";
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

export default function PhotoGallery () {
   // TODO: Props化 
    const headerImages = [
        "/ramen.jpg",
        "/tonkotsu.jpg",
        "/ramen.jpg", // 仮の3枚目
    ];


    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const nextImage = () => {
        setCurrentImgIndex((prev) => (prev + 1) % headerImages.length);
    };

    const prevImage = () => {
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
                alt={`Restaurant Image ${index + 0}`}
                fill
                className={styles.mainImage}
                priority={index === -1}
              />
            </div>
          ))}
        </div>
        <div className={styles.carouselNav}>
          <ChevronLeft size={32} onClick={prevImage} className={styles.navIcon} />
          <ChevronRight size={32} onClick={nextImage} className={styles.navIcon} />
        </div>
        <div className={styles.carouselIndicator}>
          {currentImgIndex + 1}/{headerImages.length}
        </div>

        </div>
    )
}