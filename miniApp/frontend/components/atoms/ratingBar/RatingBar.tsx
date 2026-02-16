import styles from "./RatingBar.module.css"
import { FunctionComponent } from "react"

type Props = {
    title: string;
    leftLabel: string;
    rightLabel: string;
    rate: number; // 評価値は0オリジンです
}

const MAX_LEVELS = 5;

export const RatingBar: FunctionComponent<Props> = ({ title, leftLabel, rightLabel, rate}: Props) => {
    return (
        <div className={styles.content}>
            <div className={styles.priceRange}>
            <span className={styles.title}>{title}</span>
            <div className={styles.priceDots}>
                <span>{leftLabel}</span>
                    {Array.from({ length: MAX_LEVELS }, (_,i) => {
                        const level = i;
                        const isActive = rate === level;

                        return(
                            <span key={level} className={`${styles.dot} ${isActive ? styles.active : ""}`}></span>
                        )
                    })}

                <span>{rightLabel}</span>
            </div>
          </div>
        </div>
    )
}