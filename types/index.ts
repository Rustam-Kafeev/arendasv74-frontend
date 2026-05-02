export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  phone_verified_at?: string;
  is_admin?: boolean;
  avatar?: string;
  avatar_url?: string;
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
    car_id: number;
    city_id: number;
  };
}

export interface Car {
  id: number;
  user_id: number;
  brand: string;
  model: string;
  year: number;
  description: string;
  city: string; // оставлено для обратной совместимости, в будущем можно убрать
  price_per_day: string; // аналогично
  buyout_price: string | null;
  photos: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'phone' | 'avatar_url'>;
  views_today?: number;
  views_count?: number;
  cities?: City[]; // новый массив городов с индивидуальными ценами
  defaultPrice?: string; // цена по умолчанию, если не выбран конкретный город
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  cars_count: number;
  active_cars: number;
  today_views: number;
  unread_messages: number;
  total_views?: number;
  views_chart?: { date: string; count: number }[];
  recent_messages?: {
    id: number;
    body: string;
    created_at: string;
    user_name: string;
    car_brand: string;
    car_model: string;
  }[];
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
    page: number | null;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}