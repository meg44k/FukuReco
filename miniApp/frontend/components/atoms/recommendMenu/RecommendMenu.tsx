import {Menu} from '@/types/menu'
import styles from './RecommendMenu.module.css'
type recommendMenuProps = {
    recommendMenu: Menu;
} 

export default function RecommendMenu ({ recommendMenu }: recommendMenuProps) {
 return (
    <div className={styles.recommendedItem}>
        <div className={styles.itemImage}></div>
        <div className={styles.itemInfo}>
            <p className={styles.itemName}>{recommendMenu.name}</p>
            <p className={styles.itemDesc}>{recommendMenu.detail}</p>
            <p className={styles.itemPrice}>¥{recommendMenu.price}</p>
        </div>
    </div>
 )
}