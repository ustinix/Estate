export interface Estate {
  id: number;
  estate_type_id: number;
  estate_type_name: string;
  estate_type_icon: string;
  name: string;
  user_id?: number;
  description?: string;
  recoupment?: number;
  active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EstateRequest {
  estate_type_id: number;
  name: string;
  user_id?: string;
}

export interface EstateResponse {
  id: number;
  estate_type_id: number;
  estate_type_name: string;
  estate_type_icon: string;
  name: string;
  user_id: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface EstateType {
  id: number;
  name: string;
  icon: string;
}
