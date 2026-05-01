import styles from './Price.module.css';
import { formatPrice } from '@/lib/format';

interface PriceProps {
  price: number | string | undefined | null;
  className?: string;
}

/**
 * 金額を表示するための共通コンポーネント
 * 価格が存在しない場合は何もレンダリングしません。
 */
export const Price = ({ price, className }: PriceProps) => {
  const formattedPrice = formatPrice(price);
  
  if (!formattedPrice) return null;

  return (
    <span className={`${styles.price} ${className || ''}`}>
      <span className={styles.currencyMark} aria-hidden="true">¥</span>
      {formattedPrice}
    </span>
  );
};
