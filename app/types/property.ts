export interface PropertyType {
  name: string;
  icon: string;
}

export interface Property {
  id: string;
  type: PropertyType['name'];
  name: string;
  description: string;
  recoupment: number;
}
