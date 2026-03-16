import { NextResponse } from 'next/server';
import { Menu } from '@/types/menu';

export async function GET() {
  const dummyData: Menu[] = [
    {
      spotId: "p-001",
      name: "博多とんこつラーメン",
      price: 850,
      detail: "24時間炊き出した濃厚なスープが自慢の一品です。",
      AssetId: "/tonkotsu.jpg",
      isrecommend: true,
    },
    {
      spotId: "p-001",
      name: "特製チャーシューメン",
      price: 1100,
      detail: "自家製チャーシューがたっぷりのった贅沢なラーメンです。",
      AssetId: "/ramen.jpg",
      isrecommend: false,
    },
    {
      spotId: "p-002",
      name: "門司港焼きカレー",
      price: 980,
      detail: "門司港名物！とろ〜りチーズと卵が絶妙なハーモニー。",
      AssetId: "/sampleImage.png",
      isrecommend: true,
    },
  ];

  return NextResponse.json(dummyData);
}
