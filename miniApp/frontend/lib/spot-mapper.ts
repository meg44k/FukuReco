import { Spot, Restaurant, Shop, RestingSpot, SightseeingSpot } from "@/types/spot";

/**
 * API/DBからの生のデータ構造を定義（スネークケース）
 */
export interface RawSpot {
  id: number;
  name: string;
  catchphrase?: string;
  distance_from_transit?: string;
  stay_duration?: string;
  fukureko_comment?: string;
  address: string;
  business_hours?: string;
  phone_number?: string;
  nearest_station?: string;
  website_url?: string;
  average_budget?: string | number;
  place_type: string;
  pricing?: Record<string, unknown>;
  facilities?: Record<string, unknown>;
  updated_at: string;
  created_at: string;
  nearby_coin_lockers?: string;
  parking_info?: string;
  payment_methods?: string[];
  closed_days?: string;
  remarks?: string;
  latitude?: string | number;
  longitude?: string | number;
}

export interface RawRestaurant extends RawSpot {
  avg_lunch_budget?: string;
  avg_dinner_budget?: string;
  seating_info?: number;
  avg_wait_time?: string;
  reservation_url?: string;
  restaurant_comment?: string;
}

export interface RawShop extends RawSpot {
  shop_comment?: string;
}

export interface RawRestingSpot extends RawSpot {
  seating_info?: string;
}

export interface RawSightseeingSpot extends RawSpot {
  avg_wait_time?: string;
}

/**
 * DBの共通カラムをフロントエンドのSpot型にマッピングする
 */
function mapBaseSpot(raw: RawSpot): Spot {
  return {
    id: raw.id,
    name: raw.name,
    catchphrase: raw.catchphrase,
    distanceFromTransit: raw.distance_from_transit,
    stayDuration: raw.stay_duration,
    fukurekoComment: raw.fukureko_comment,
    address: raw.address,
    businessHours: raw.business_hours,
    phoneNumber: raw.phone_number,
    nearestStation: raw.nearest_station,
    websiteUrl: raw.website_url,
    averageBudget: raw.average_budget,
    placeType: raw.place_type,
    pricing: raw.pricing || {},
    facilities: raw.facilities || {},
    updatedAt: new Date(raw.updated_at),
    createdAt: new Date(raw.created_at),
    nearbyCoinLockers: raw.nearby_coin_lockers,
    parkingInfo: raw.parking_info,
    paymentMethods: raw.payment_methods,
    closedDays: raw.closed_days,
    remarks: raw.remarks,
    latitude: raw.latitude ? (typeof raw.latitude === "string" ? parseFloat(raw.latitude) : raw.latitude) : undefined,
    longitude: raw.longitude ? (typeof raw.longitude === "string" ? parseFloat(raw.longitude) : raw.longitude) : undefined,
  };
}

export function mapToRestaurant(raw: RawRestaurant): Restaurant {
  return {
    ...mapBaseSpot(raw),
    avgLunchBudget: raw.avg_lunch_budget,
    avgDinnerBudget: raw.avg_dinner_budget,
    seatingInfo: raw.seating_info,
    avgWaitTime: raw.avg_wait_time,
    reservationURL: raw.reservation_url,
    restaurantComment: raw.restaurant_comment,
  };
}

export function mapToShop(raw: RawShop): Shop {
  return {
    ...mapBaseSpot(raw),
    shopComment: raw.shop_comment,
  };
}

export function mapToRestingSpot(raw: RawRestingSpot): RestingSpot {
  return {
    ...mapBaseSpot(raw),
    seatingInfo: raw.seating_info,
  };
}

export function mapToSightseeingSpot(raw: RawSightseeingSpot): SightseeingSpot {
  return {
    ...mapBaseSpot(raw),
    avgWaitTime: raw.avg_wait_time,
  };
}
