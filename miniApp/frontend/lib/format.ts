/**
 * 金額に3桁ごとのカンマを追加する
 * 
 * @param price 金額（数値または文字列）
 * @returns カンマ区切り済みの文字列
 */
export const formatPrice = (price: string | number | undefined | null): string => {
  if (price === undefined || price === null || String(price).trim() === "") return "";
  
  // 数値への変換を試みる
  const num = Number(price);
  
  // 有効な数値であれば、ja-JPロケールを明示してフォーマット
  if (!isNaN(num) && typeof num === 'number') {
    return num.toLocaleString('ja-JP');
  }
  
  // 数値として扱えない場合はそのまま返す
  return String(price);
};
