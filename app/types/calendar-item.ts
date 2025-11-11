export interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  type: 'transaction' | 'meeting' | 'reminder';
  amount?: number;
  direction?: boolean;
  description?: string;
  estateId?: number;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  isAllDay?: boolean;
  source: 'transaction' | 'meeting';
}

export interface CreateMeetingData {
  title: string;
  date: Date;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  isAllDay?: boolean;
}
