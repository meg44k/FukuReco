import React from 'react';
import styles from './SpotCardSkeleton.module.css';

export const SpotCardSkeleton = () => {
    return (
        <div className={styles.spotCard}>
            <div className={styles.cardHeader}>
                <div className={styles.titleContainer}>
                    <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
                </div>
                <div className={`${styles.skeleton} ${styles.statusSkeleton}`} />
            </div>

            <div className={`${styles.skeleton} ${styles.cardImage}`} />

            <div className={styles.cardContents}>
                <div className={styles.row}>
                    <div className={styles.tagsRow}>
                        <div className={`${styles.skeleton} ${styles.tagItem}`} />
                        <div className={`${styles.skeleton} ${styles.tagItem}`} />
                    </div>
                    <div className={styles.pieceRange}>
                        <div className={`${styles.skeleton} ${styles.pieceIconSkeleton}`} />
                        <div className={`${styles.skeleton} ${styles.priceSkeleton}`} />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.tagsRow}>
                        <div className={`${styles.skeleton} ${styles.tagItem}`} />
                    </div>
                    <div className={styles.pieceRange}>
                        <div className={`${styles.skeleton} ${styles.pieceIconSkeleton}`} />
                        <div className={`${styles.skeleton} ${styles.priceSkeleton}`} />
                    </div>
                </div>
            </div>

            <div className={styles.cardFooter}>
                <div className={`${styles.skeleton} ${styles.buttonSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.buttonSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.favoriteSkeleton}`} />
            </div>
        </div>
    );
};
