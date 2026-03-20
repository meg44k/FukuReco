import { NextResponse } from 'next/server';
import { Restaurant } from '@/types/spot';

export async function GET() {
  const dummyData: Restaurant = {
  id: "p-001",
  name: "海風テラス 門司港",
  catchphrase: "関門海峡を一望できる、レトロモダンなカフェ＆ワークスペース",
  distanceFromTransit: "門司港駅から徒歩5分",
  stayDuration: "1〜2時間",
  fukurekoComment: "夕暮れ時の窓際席は、言葉を失うほど美しいですよ。",
  address: "福岡県北九州市門司区港町1-1",
  businessHours: "10:00 - 19:00",
  closedDays: "毎週火曜日、年末年始",
  phoneNumber: "093-123-4567",
  nearestStation: "JR門司港駅",
  paymentMethods: ["クレジットカード", "PayPay", "交通系IC"],
  parkingInfo: "近隣のコインパーキング（提携あり）をご利用ください",
  websiteUrl: "https://example.com/mojiko-terrace",
  nearbyCoinLockers: "門司港駅改札横に中型・大型ロッカーあり",
  
  // PricingInfo の具体例
  pricing: {
    adult: 1200,
    student: 800,
    child: 500,
    note: "ワークスペース利用は1時間500円〜"
  },
  
  placeType: "Cafe / Co-working",
  
  // Date オブジェクト
  updatedAt: new Date("2024-03-14T10:00:00"),
  createdAt: new Date("2024-01-01T09:00:00"),
  deletedAt: null,
  
  // FacilityInfo の具体例
  facilities: {
    hasWifi: true,
    hasPowerOutlet: true,
    isSmokingAllowed: false,
    hasWheelchairAccess: true,
    petFriendly: "テラス席のみ可"
  },
  
  remarks: "混雑時は90分制となる場合があります。",
  averageBudget: "1,500円"
};
  
  return NextResponse.json(dummyData);
}

