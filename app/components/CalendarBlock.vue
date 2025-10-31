<script setup lang="ts">
import type { Estate } from '~/types/estate';
import type { Event } from '~/types/events';

const props = defineProps<{
  userEstates: Estate[];
}>();

const selectedEstateId = ref('all');
const currentDate = new Date();
const selectedEvent = ref<Event | null>(null);
const showEventModal = ref(false);

// Моковые данные статистики (будет приходить с бэка)
const mockStats = {
  totalIncome: 108000,
  totalExpense: 45000,
  balance: 63000,
  totalEvents: 8,
  period: 'Январь 2024',
};

const getEstateName = (estateId: number): string => {
  const estate = props.userEstates.find(e => e.id === estateId);
  return estate?.name || 'Неизвестная недвижимость';
};

// Моковые события (будет приходить с бэка)
const generateMockEvents = (estates: Estate[]): Event[] => {
  const events: Event[] = [];

  estates.forEach(estate => {
    const estateId = estate.id;

    if (estateId === 1) {
      events.push({
        id: `${estateId}_mortgage`,
        estateId,
        title: 'Ипотека',
        type: 'Расход',
        amount: 15000,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        repeat: 'monthly',
        description: 'Ежемесячный платеж по ипотеке за гараж',
      });
    }

    if (estateId === 2 || estateId === 10) {
      events.push({
        id: `${estateId}_rent`,
        estateId,
        title: 'Аренда',
        type: 'Доход',
        amount: estateId === 2 ? 45000 : 35000,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
        repeat: 'monthly',
        description: `Поступление арендной платы за ${estate.name}`,
      });

      events.push({
        id: `${estateId}_utilities`,
        estateId,
        title: 'Коммунальные',
        type: 'Расход',
        amount: estateId === 2 ? 8000 : 7000,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        repeat: 'monthly',
        description: 'Оплата жилищно-коммунальных услуг',
      });
    }

    if (estateId === 6) {
      events.push({
        id: `${estateId}_income`,
        estateId,
        title: 'Сдача в аренду',
        type: 'Доход',
        amount: 28000,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5),
        repeat: 'monthly',
        description: 'Арендный доход от новой квартиры',
      });
    }

    if (estateId % 3 === 0) {
      events.push({
        id: `${estateId}_service_income`,
        estateId,
        title: 'Обслуживание',
        type: 'Доход',
        amount: 8000,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 8),
        repeat: 'monthly',
        description: 'Доход от технического обслуживания',
      });
    }
  });

  return events;
};

const filteredEvents = computed(() => {
  const allEvents = generateMockEvents(props.userEstates);
  if (selectedEstateId.value === 'all') return allEvents;

  return allEvents.filter(event => event.estateId === Number(selectedEstateId.value));
});

const eventsByDate = computed(() => {
  const grouped: Record<string, Event[]> = {};

  filteredEvents.value.forEach(event => {
    const dateKey = event.date.toISOString().split('T')[0];
    if (dateKey) {
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    }
  });

  return grouped;
});

const getEventsForDay = (day: any) => {
  return eventsByDate.value[day.id] || [];
};

const handleEventClick = (event: Event) => {
  selectedEvent.value = event;
  showEventModal.value = true;
};

const formatAmount = (amount: number) => {
  return amount.toLocaleString() + '₽';
};
const getEventTypeClass = (type: string) => {
  return type.toLowerCase() === 'доход' ? 'income' : 'expense';
};
</script>

<template>
  <div class="calendar-block">
    <div class="calendar-header">
      <h4>Календарь платежей</h4>
      <div class="estate-selector">
        <label for="estate-select">Выберите недвижимость:</label>
        <select id="estate-select" v-model="selectedEstateId">
          <option value="all">Все объекты</option>
          <option v-for="estate in userEstates" :key="estate.id" :value="estate.id">
            {{ estate.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="stats-info">
      <div class="stats-card">
        <div class="stats-header">
          <h5>Тут будет статистика (пока данные тестовые)</h5>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Всего событий</div>
            <div class="stat-value">{{ mockStats.totalEvents }}</div>
          </div>
          <div class="stat-item income">
            <div class="stat-label">Общий доход</div>
            <div class="stat-value">{{ formatAmount(mockStats.totalIncome) }}</div>
          </div>
          <div class="stat-item expense">
            <div class="stat-label">Общий расход</div>
            <div class="stat-value">{{ formatAmount(mockStats.totalExpense) }}</div>
          </div>
          <div
            class="stat-item balance"
            :class="{ positive: mockStats.balance >= 0, negative: mockStats.balance < 0 }"
          >
            <div class="stat-label">Остаток средств</div>
            <div class="stat-value">{{ formatAmount(mockStats.balance) }}</div>
          </div>
        </div>
      </div>
    </div>

    <ClientOnly>
      <div class="calendar-scroll-wrapper">
        <div class="calendar-container">
          <VCalendar expanded borderless trim-weeks class="custom-calendar outlook-style">
            <template #day-content="{ day }">
              <div class="day-cell">
                <div class="day-number">{{ day.day }}</div>
                <div class="events-list">
                  <div
                    v-for="event in getEventsForDay(day)"
                    :key="event.id"
                    class="event-line"
                    :class="getEventTypeClass(event.type)"
                    @click.stop="handleEventClick(event)"
                  >
                    <span class="event-title">{{ getEstateName(event.estateId) }}</span>
                    <span class="event-amount">{{ formatAmount(event.amount) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </VCalendar>
        </div>
      </div>

      <template #fallback>
        <div class="calendar-loading">
          <span>Загрузка календаря...</span>
        </div>
      </template>
    </ClientOnly>

    <q-dialog v-model="showEventModal">
      <q-card v-if="selectedEvent" class="event-modal">
        <q-card-section class="modal-header">
          <div class="modal-title">
            <div>
              <h5>{{ getEstateName(selectedEvent.estateId) }}</h5>
              <p class="operation-type">{{ selectedEvent.title }}</p>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="modal-details">
          <div class="detail-row">
            <span class="detail-label">Сумма:</span>
            <span class="detail-value" :class="getEventTypeClass(selectedEvent.type)">
              {{ formatAmount(selectedEvent.amount) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Тип операции:</span>
            <span class="detail-value">
              {{ selectedEvent.type }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Вид операции:</span>
            <span class="detail-value">
              {{ selectedEvent.title }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Периодичность:</span>
            <span class="detail-value">
              {{
                selectedEvent.repeat === 'monthly'
                  ? 'Ежемесячно'
                  : selectedEvent.repeat === 'yearly'
                    ? 'Ежегодно'
                    : 'Разовая операция'
              }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Дата:</span>
            <span class="detail-value">
              {{ selectedEvent.date.toLocaleDateString('ru-RU') }}
            </span>
          </div>
          <div class="detail-row full-width">
            <span class="detail-label">Описание:</span>
            <span class="detail-value description">
              {{ selectedEvent.description }}
            </span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Закрыть" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.calendar-block {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.estate-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.estate-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.stats-info {
  margin-bottom: 25px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.stats-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f5f5f5;
}

.stats-header h5 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  text-align: center;
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-item.income {
  background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
  border: 1px solid #4caf50;
}

.stat-item.expense {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  border: 1px solid #f44336;
}

.stat-item.balance.positive {
  background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
  border: 1px solid #4caf50;
}

.stat-item.balance.negative {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  border: 1px solid #f44336;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.stat-item.income .stat-value {
  color: #2e7d32;
}

.stat-item.expense .stat-value {
  color: #c62828;
}

.stat-item.balance.positive .stat-value {
  color: #2e7d32;
}

.stat-item.balance.negative .stat-value {
  color: #c62828;
}

.calendar-container {
  overflow-x: auto;
  overflow-y: hidden;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.calendar-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #666;
}

:deep(.outlook-style .vc-day) {
  min-height: 120px;
  border: 1px solid #e0e0e0;
  background: white;
}

:deep(.outlook-style .vc-day:not(.vc-disabled):hover) {
  background: #f8f9fa;
}

:deep(.outlook-style .vc-day-content) {
  height: 100%;
  padding: 4px;
}

.day-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.day-number {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
}

.events-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-line {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.event-line:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-line.income {
  background: rgba(76, 175, 80, 0.1);
  border-left-color: #4caf50;
}

.event-line.expense {
  background: rgba(244, 67, 54, 0.1);
  border-left-color: #f44336;
}

.event-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.event-amount {
  font-weight: bold;
  flex-shrink: 0;
}

.event-line.income .event-amount {
  color: #2e7d32;
}

.event-line.expense .event-amount {
  color: #c62828;
}

.event-modal {
  min-width: 400px;
  max-width: 500px;
}

.modal-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.operation-type {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-style: italic;
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-row.full-width {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.detail-label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
}

.detail-value.income {
  color: #2e7d32;
  font-weight: bold;
}

.detail-value.expense {
  color: #c62828;
  font-weight: bold;
}

.detail-value.description {
  line-height: 1.4;
  color: #555;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
    h4 {
      font-size: 18px;
    }
  }

  .estate-selector {
    justify-content: space-between;
    /* display: flex;
  align-items: center;
  gap: 10px; */
  }

  .estate-selector select {
    width: 120px;
    padding: 8px 0px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .event-modal {
    min-width: 90vw;
    margin: 20px;
  }

  :deep(.outlook-style .vc-day) {
    min-height: 100px;
  }

  .event-line {
    font-size: 9px;
    padding: 2px 4px;
  }
}
</style>
