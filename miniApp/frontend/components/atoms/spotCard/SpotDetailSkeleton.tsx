import React from 'react';
import styles from './SpotDetailSkeleton.module.css';

export const SpotDetailSkeleton = () => {
    return (
        <div className={styles.container}>
            {/* Header Image Area */}
            <div className={`${styles.skeleton} ${styles.headerSkeleton}`} />

            {/* Main Content Area */}
            <div className={styles.content}>
                <div className={`${styles.skeleton} ${styles.catchphraseSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
                <div className={styles.tagsSkeleton}>
                    <div className={`${styles.skeleton} ${styles.tagItem}`} />
                    <div className={`${styles.skeleton} ${styles.tagItem}`} />
                    <div className={`${styles.skeleton} ${styles.tagItem}`} />
                </div>
            </div>

            {/* Safety Grid Section */}
            <div className={styles.section}>
                <div className={`${styles.skeleton} ${styles.sectionHeader}`} />
                <div className={styles.grid}>
                    <div className={`${styles.skeleton} ${styles.cardSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.cardSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.cardSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.cardSkeleton}`} />
                </div>
            </div>

            {/* Menu Section Preview */}
            <div className={styles.section}>
                <div className={`${styles.skeleton} ${styles.sectionHeader}`} />
                <div className={`${styles.skeleton} ${styles.menuItem}`} />
                <div className={`${styles.skeleton} ${styles.menuItem}`} />
            </div>

            {/* Fixed Footer Preview */}
            <div className={styles.footer}>
                <div className={`${styles.skeleton} ${styles.footerBtn}`} />
                <div className={`${styles.skeleton} ${styles.footerBtn}`} />
                <div className={`${styles.skeleton} ${styles.footerCircle}`} />
            </div>
        </div>
    );
};
