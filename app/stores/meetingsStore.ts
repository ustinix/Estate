import { defineStore } from 'pinia';
import type { CalendarItem, CreateMeetingData } from '~/types/calendar-item';

interface StoredMeeting extends Omit<CalendarItem, 'date'> {
  date: string;
}

export const useMeetingsStore = defineStore('meetings', () => {
  const meetings = ref<CalendarItem[]>([]);

  const getMeetingsByDate = computed(() => (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return meetings.value.filter(meeting => {
      const meetingDateString = meeting.date.toISOString().split('T')[0];
      return meetingDateString === dateString;
    });
  });

  const loadMeetings = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('user-meetings');
      if (stored) {
        try {
          const parsed: StoredMeeting[] = JSON.parse(stored);
          meetings.value = parsed.map(meeting => ({
            ...meeting,
            date: new Date(meeting.date),
          }));
        } catch (error) {
          console.error('Failed to load meetings from localStorage:', error);
          meetings.value = [];
        }
      }
    }
  };

  const saveMeetings = () => {
    if (import.meta.client) {
      const meetingsToStore: StoredMeeting[] = meetings.value.map(meeting => ({
        ...meeting,
        date: meeting.date.toISOString(), // Сохраняем как строку
      }));
      localStorage.setItem('user-meetings', JSON.stringify(meetingsToStore));
    }
  };

  const createMeeting = (meetingData: CreateMeetingData): CalendarItem => {
    const newMeeting: CalendarItem = {
      id: `meeting_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      title: meetingData.title,
      date: meetingData.date,
      type: 'meeting',
      description: meetingData.description || '',
      priority: meetingData.priority || 'medium',
      isAllDay: meetingData.isAllDay || false,
      source: 'meeting',
    };

    meetings.value.push(newMeeting);
    saveMeetings();
    return newMeeting;
  };

  const deleteMeeting = (meetingId: string): void => {
    meetings.value = meetings.value.filter(meeting => meeting.id !== meetingId);
    saveMeetings();
  };

  return {
    meetings,
    getMeetingsByDate,
    loadMeetings,
    saveMeetings,
    createMeeting,
    deleteMeeting,
  };
});
