<script setup lang="ts">
import type { Estate } from '~/types/estate';
import type { CalendarItem, CreateMeetingData } from '~/types/calendar-item';
import { useMeetingsStore } from '~/stores/meetingsStore';
import type { CalendarTransaction } from '~/types/transactions';
import CreateMeetingModal from '~/components/CreateMeetingModal.vue';

const { formatCurrencyForChart } = useFormatters();

interface Props {
  userEstates: Estate[];
  transactions: CalendarTransaction[];
}

const props = defineProps<Props>();

const selectedEstateId = ref('all');
const selectedItem = ref<CalendarItem | null>(null);
const showItemModal = ref(false);
const showCreateMeetingModal = ref(false);
const meetingsStore = useMeetingsStore();

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
  meetingsStore.loadMeetings();
});

const transformTransactionToCalendarItem = (transaction: CalendarTransaction): CalendarItem => ({
  id: `transaction_${transaction.transaction_id}`,
  title: transaction.transaction_type_name,
  date: new Date(transaction.date),
  type: 'transaction',
  amount: parseFloat(transaction.sum),
  direction: transaction.transaction_type_direction,
  description: transaction.comment || `Транзакция по ${transaction.estate_name}`,
  estateId: transaction.estate_id,
  color: transaction.transaction_type_direction ? 'green' : 'red',
  source: 'transaction',
});

const calendarItems = computed(() => {
  const transactions = props.transactions.map(transformTransactionToCalendarItem);
  const meetings = meetingsStore.meetings;
  return [...transactions, ...meetings].sort((a, b) => a.date.getTime() - b.date.getTime());
});

const filteredItems = computed(() => {
  if (selectedEstateId.value === 'all') return calendarItems.value;
  return calendarItems.value.filter(
    item => item.source === 'meeting' || item.estateId === Number(selectedEstateId.value),
  );
});

const stats = computed(() => {
  const transactions = filteredItems.value.filter(item => item.source === 'transaction');
  const incomeTransactions = transactions.filter(t => t.direction);
  const expenseTransactions = transactions.filter(t => !t.direction);

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  return {
    totalTransactions: transactions.length,
    totalMeetings: filteredItems.value.filter(item => item.source === 'meeting').length,
    totalIncome,
    totalExpense,
    balance,
    period: 'Текущий период',
  };
});

const itemsByDate = computed(() => {
  const grouped: Record<string, CalendarItem[]> = {};

  filteredItems.value.forEach(item => {
    const dateKey = item.date.toISOString().split('T')[0];
    if (dateKey) {
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    }
  });

  return grouped;
});

const getItemsForDay = (day: any) => {
  const items = itemsByDate.value[day.id] || [];
  return items;
};

const handleItemClick = (item: CalendarItem) => {
  selectedItem.value = item;
  showItemModal.value = true;
};

const handleCreateMeeting = (meetingData: CreateMeetingData) => {
  meetingsStore.createMeeting(meetingData);
  showCreateMeetingModal.value = false;
};

const handleDeleteMeeting = (meetingId: string) => {
  meetingsStore.deleteMeeting(meetingId);
  if (selectedItem.value?.id === meetingId) {
    showItemModal.value = false;
  }
};

const getItemTypeClass = (item: CalendarItem) => {
  if (item.source === 'transaction') {
    return item.direction ? 'income' : 'expense';
  }
  return item.type;
};

const getEstateName = (estateId?: number): string => {
  if (!estateId) return '';
  const estate = props.userEstates.find(e => e.id === estateId);
  return estate?.name || 'Неизвестная недвижимость';
};

const getItemTypeText = (item: CalendarItem) => {
  if (item.source === 'transaction') {
    return item.direction ? 'Доход' : 'Расход';
  }
  return 'Событие';
};

const getPriorityClass = (item: CalendarItem) => {
  if (item.source === 'meeting' && item.priority) {
    return `priority-${item.priority}`;
  }
  return '';
};
const estateOptions = computed(() => {
  return [
    { label: 'Все объекты', value: 'all' },
    ...props.userEstates.map(estate => ({
      label: estate.name,
      value: estate.id.toString(),
    })),
  ];
});
</script>

<template>
  <div class="calendar-block">
    <div class="calendar-header">
      <h4>Календарь платежей и событий</h4>
      <div class="header-controls">
        <div class="estate-selector">
          <label for="estate-select">Недвижимость:</label>
          <q-select
            v-model="selectedEstateId"
            :options="estateOptions"
            label="Недвижимость"
            outlined
            dense
            emit-value
            map-options
            style="min-width: 200px"
            class="q-select-estate"
            id="estate-select"
          />
        </div>

        <q-btn
          color="secondary"
          class="button"
          icon="add"
          label="Добавить событие"
          @click="showCreateMeetingModal = true"
        />
      </div>
    </div>

    <div class="stats-info">
      <div class="stats-card">
        <div class="stats-header">
          <h5>Статистика</h5>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Транзакции</div>
            <div class="stat-value">{{ stats.totalTransactions }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">События</div>
            <div class="stat-value">{{ stats.totalMeetings }}</div>
          </div>
          <div class="stat-item income">
            <div class="stat-label">Общий доход</div>
            <div class="stat-value">{{ formatCurrencyForChart(stats.totalIncome.toString()) }}</div>
          </div>
          <div class="stat-item expense">
            <div class="stat-label">Общий расход</div>
            <div class="stat-value">
              {{ formatCurrencyForChart(stats.totalExpense.toString()) }}
            </div>
          </div>
          <div
            class="stat-item balance"
            :class="{ positive: stats.balance >= 0, negative: stats.balance < 0 }"
          >
            <div class="stat-label">Остаток средств</div>
            <div class="stat-value">{{ formatCurrencyForChart(stats.balance.toString()) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="calendar-scroll-wrapper">
      <div class="scroll-hint">
        <span>← прокрутите для просмотра →</span>
      </div>
      <div v-if="isMounted" class="calendar-container">
        <VCalendar expanded borderless trim-weeks class="custom-calendar outlook-style">
          <template #day-content="{ day }">
            <div class="day-cell">
              <div class="day-number">{{ day.day }}</div>
              <div class="events-list">
                <div
                  v-for="item in getItemsForDay(day)"
                  :key="item.id"
                  class="event-line"
                  :class="[getItemTypeClass(item), getPriorityClass(item)]"
                  @click.stop="handleItemClick(item)"
                >
                  <span class="event-title">{{ item.title }}</span>
                  <span v-if="item.amount" class="event-amount">
                    {{ formatCurrencyForChart(item.amount.toString()) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </VCalendar>
      </div>

      <div v-else class="calendar-loading">
        <span>Загрузка календаря...</span>
      </div>
    </div>

    <q-dialog v-model="showItemModal">
      <q-card v-if="selectedItem" class="event-modal">
        <q-card-section class="modal-header">
          <div class="modal-title">
            <div>
              <h5>{{ selectedItem.title }}</h5>
            </div>
            <q-btn
              v-if="selectedItem.source === 'meeting'"
              icon="delete"
              flat
              round
              color="negative"
              @click="handleDeleteMeeting(selectedItem.id)"
            >
              <q-tooltip> Удалить </q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section class="modal-details">
          <div v-if="selectedItem.amount" class="detail-row">
            <span class="detail-label">Сумма:</span>
            <span class="detail-value" :class="getItemTypeClass(selectedItem)">
              {{ formatCurrencyForChart(selectedItem.amount.toString()) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Тип:</span>
            <span class="detail-value">
              {{ getItemTypeText(selectedItem) }}
            </span>
          </div>
          <div v-if="selectedItem.estateId" class="detail-row">
            <span class="detail-label">Недвижимость:</span>
            <span class="detail-value">
              {{ getEstateName(selectedItem.estateId) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Дата:</span>
            <span class="detail-value">
              {{ selectedItem.date.toLocaleDateString('ru-RU') }}
            </span>
          </div>
          <div v-if="selectedItem.description" class="detail-row full-width">
            <span class="detail-label">Описание:</span>
            <span class="detail-value description">
              {{ selectedItem.description }}
            </span>
          </div>
          <div v-if="selectedItem.source === 'meeting'" class="detail-row">
            <span class="detail-label">Приоритет:</span>
            <span class="detail-value">
              {{
                selectedItem.priority === 'high'
                  ? 'Высокий'
                  : selectedItem.priority === 'medium'
                    ? 'Средний'
                    : 'Низкий'
              }}
            </span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Закрыть" color="indigo-10" v-close-popup class="button" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <CreateMeetingModal v-model="showCreateMeetingModal" @create="handleCreateMeeting" />
  </div>
</template>

<style scoped>
.calendar-block {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  overflow-x: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem;
}

.calendar-header h4 {
  margin: 0;
  color: var(--text-color-black);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  flex: 1;
  min-width: 200px;
}

.header-controls {
  padding: 0 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: flex-end;
}

.estate-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 300px;
}

.estate-selector label {
  font-weight: 500;
  color: var(--text-color-black);
  white-space: nowrap;
  font-size: 0.87rem;
  flex-shrink: 0;
}

.q-select-estate {
  min-width: 100px;
}

.create-event-btn {
  flex-shrink: 0;
}

.stats-info {
  margin-bottom: 1.5rem;
  width: 100%;
}

.stats-card {
  background: var(--bg-color-light);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px var(--box-shadow);
  border: 1px solid var(--border-color);
  width: 100%;
  overflow: hidden;
}

.stats-header {
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border-color);
}

.stats-header h5 {
  margin: 0;
  color: var(--text-color-black);
  font-size: 1.125rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  padding: 1.25rem;
  border-radius: 16px;
  background: var(--bg-color);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--box-shadow);
}

.stat-item.income {
  background: var(--income-bg);
  border: 1px solid var(--income-border);
}

.stat-item.expense {
  background: var(--expense-bg);
  border: 1px solid var(--expense-border);
}

.stat-item.balance.positive {
  background: var(--income-bg);
  border: 1px solid var(--income-border);
}

.stat-item.balance.negative {
  background: var(--expense-bg);
  border: 1px solid var(--expense-border);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--label);
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color-black);
}

.stat-item.income .stat-value {
  color: var(--income);
}

.stat-item.expense .stat-value {
  color: var(--expense);
}

.stat-item.balance.positive .stat-value {
  color: var(--income);
}

.stat-item.balance.negative .stat-value {
  color: var(--expense);
}

.calendar-scroll-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-color-light);
  padding: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.scroll-hint {
  position: absolute;
  top: -1.75rem;
  right: 1rem;
  font-size: 0.75rem;
  color: var(--label);
  opacity: 0.8;
  font-weight: 500;
  display: none;
}

.calendar-scroll-wrapper:hover .scroll-hint {
  display: block;
}

.calendar-container {
  min-width: 1100px;
  background: var(--bg-color-light);
}

.calendar-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: var(--bg-color-light);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  color: var(--label);
  font-size: 1rem;
  font-weight: 500;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading-indicator::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

:deep(.custom-calendar.outlook-style) {
  width: 100%;
  min-width: 1100px;
}

:deep(.outlook-style .vc-day) {
  min-height: 130px;
  height: 130px !important;
  border: 1px solid var(--border-color);
  background: var(--bg-color-light);
  padding: 4px !important;
  margin: 0 !important;
  width: calc(100% / 7) !important;
}

:deep(.outlook-style .vc-day:not(.vc-disabled):hover) {
  background: var(--bg-color);
}

:deep(.outlook-style .vc-day-content) {
  height: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
}

:deep(.vc-day) {
  flex: 1 0 calc(100% / 7);
  max-width: calc(100% / 7);
  min-width: calc(100% / 7);
}

:deep(.vc-weeks) {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

:deep(.vc-week) {
  display: flex;
  width: 100%;
  margin: 0;
}

:deep(.vc-title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-black);
  text-align: center;
}

:deep(.vc-header) {
  padding: 0 15px 10px 15px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--border-color);
}

:deep(.vc-weekdays) {
  display: flex;
  width: 100%;
  margin: 0;
  padding: 0;
}

:deep(.vc-weekday) {
  flex: 1;
  text-align: center;
  padding: 12px 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-black);
  text-transform: none;
  letter-spacing: normal;
}

.day-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-number {
  font-size: 13px;
  font-weight: bold;
  color: var(--text-color-black);
  margin-bottom: 2px;
  text-align: right;
  padding: 2px 4px;
  background: var(--bg-color);
  border-radius: 4px;
}

.events-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  max-height: 90px;
}

.event-line {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  min-height: 20px;
}

.event-line:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 6px var(--box-shadow);
}

.event-line.income {
  background: var(--income-bg);
  border-left-color: var(--income-border);
}

.event-line.expense {
  background: var(--expense-bg);
  border-left-color: var(--expense-border);
}

.event-line.priority-high {
  border-left-color: var(--expense);
  background: var(--expense-bg);
}

.event-line.priority-medium {
  border-left-color: var(--warning);
  background: var(--bg-warning);
}

.event-line.priority-low {
  border-left-color: var(--income-border);
  background: var(--income-bg);
}

.event-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
}

.event-amount {
  font-weight: bold;
  flex-shrink: 0;
  font-size: 10px;
}

.event-line.income .event-amount {
  color: var(--income);
}

.event-line.expense .event-amount {
  color: var(--expense);
}

.calendar-scroll-wrapper::-webkit-scrollbar {
  height: 10px;
}

.calendar-scroll-wrapper::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 6px;
  border: 2px solid var(--bg-color-light);
}

.calendar-scroll-wrapper::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 6px;
  margin: 2px;
}

.event-modal {
  padding: 10px 15px;
  min-width: 450px;
  max-width: 500px;
  border-radius: 16px;
}

.modal-header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.modal-title h5 {
  margin: 0;
  color: var(--text-color-black);
  font-size: 20px;
  font-weight: 600;
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px 0;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.detail-row.full-width {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.detail-label {
  font-weight: 600;
  color: var(--label);
  min-width: 120px;
  flex-shrink: 0;
  font-size: 14px;
}

.detail-value {
  flex: 1;
  font-size: 14px;
  color: var(--text-color-black);
}

.detail-value.income {
  color: var(--income);
  font-weight: bold;
}

.detail-value.expense {
  color: var(--expense);
  font-weight: bold;
}

.detail-value.description {
  line-height: 1.5;
  color: var(--label);
}
@media (max-width: 1200px) {
  .calendar-block {
    padding: 1.25rem;
  }

  .calendar-container {
    min-width: 1000px;
  }

  :deep(.custom-calendar.outlook-style) {
    min-width: 1000px;
  }
}

@media (max-width: 992px) {
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-header h4 {
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .header-controls {
    justify-content: center;
  }

  .estate-selector {
    min-width: 200px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .calendar-block {
    padding: 1rem;
  }

  .calendar-header h4 {
    font-size: 1.25rem;
  }

  .header-controls {
    flex-direction: column;
  }

  .estate-selector {
    flex-direction: column;
    min-width: 100%;
  }

  .q-select-estate {
    min-width: 100%;
    max-width: 100%;
  }

  .create-event-btn {
    width: 100%;
  }

  .stats-card {
    padding: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-item {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .calendar-container {
    min-width: 900px;
  }

  :deep(.custom-calendar.outlook-style) {
    min-width: 900px;
  }

  :deep(.outlook-style .vc-day) {
    min-height: 110px;
    height: 110px !important;
  }
}

@media (max-width: 576px) {
  .calendar-block {
    padding: 0.75rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .calendar-container {
    min-width: 800px;
  }

  :deep(.custom-calendar.outlook-style) {
    min-width: 800px;
  }

  :deep(.outlook-style .vc-day) {
    min-height: 100px;
    height: 100px !important;
  }

  .event-modal {
    min-width: 90vw !important;
    max-width: 90vw !important;
    margin: 0.5rem;
  }
}

@media (max-width: 480px) {
  .calendar-container {
    min-width: 700px;
  }

  :deep(.custom-calendar.outlook-style) {
    min-width: 700px;
  }

  :deep(.outlook-style .vc-day) {
    min-height: 90px;
    height: 90px !important;
  }

  .day-number {
    font-size: 11px;
  }

  .event-line {
    padding: 3px 5px;
    font-size: 10px;
  }

  .event-title {
    font-size: 10px;
  }
}
</style>
