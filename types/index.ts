export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  phone_verified_at?: string;
  is_admin?: boolean;
  avatar?: string;            // относительный или полный путь
  avatar_url?: string;        // полный URL (вычисляется на бэке)
  created_at: string;
  updated_at: string;
}
export interface City {
  id: number;
  name: string;
  pivot?: {
    price_per_day: string;
    buyout_price: string | null;
    description: string | null;
    is_available: boolean;
     cities?: City[];  // <-- добавить
  };
}

export interface Car {
  id: number;
  user_id: number;
  brand: string;
  model: string;
  year: number;
  description: string;
  city: string;
  price_per_day: string;
  buyout_price: string | null;
  photos: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'phone' | 'avatar_url'>; // добавлено avatar_url
  views_today?: number;
  views_count?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}