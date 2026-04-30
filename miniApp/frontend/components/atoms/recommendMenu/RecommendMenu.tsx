import {Menu} from '@/types/menu'
import styles from './RecommendMenu.module.css'
import Image from 'next/image'

type recommendMenuProps = {
    recommendMenu: Menu;
} 

export default function RecommendMenu ({ recommendMenu }: recommendMenuProps) {
    const hasImage = !!recommendMenu.assetId;
    const isHttp = typeof recommendMenu.assetId === 'string' && recommendMenu.assetId.startsWith('http');

    return (
        <div className={styles.recommendedItem}>
            {hasImage && (
                <div className={styles.itemImage}>
                    <Image 
                        src={recommendMenu.assetId!} 
                        alt={recommendMenu.name} 
                        fill 
                        style={{ objectFit: 'cover' }}
                        unoptimized={isHttp}
                    />
                </div>
            )}
            <div className={styles.itemInfo}>
                <p className={styles.itemName}>{recommendMenu.name}</p>
                <p className={styles.itemDesc}>{recommendMenu.detail}</p>
                <p className={styles.itemPrice}>¥{recommendMenu.price}</p>
            </div>
        </div>
    )
}
