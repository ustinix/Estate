export interface Estate {
  id: number;
  estate_type_id: string;
  name: string;
  user_id?: number;
  description?: string;
  recoupment?: number;
  icon?: string;
  type_name?: string;
}

export interface EstateRequest {
  estate_type_id: string | number;
  name: string;
  user_id?: string;
}

export interface EstateType {
  id: number;
  name: string;
  icon: string;
}
