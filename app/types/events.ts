export interface Event {
  id: string;
  estateId: number;
  title: string;
  type: string;
  amount: number;
  date: Date;
  repeat: string;
  description: string;
}
