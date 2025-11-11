<script setup lang="ts">
import type { Estate } from '~/types/estate';
import type { CalendarItem, CreateMeetingData } from '~/types/calendar-item';
import { useMeetingsStore } from '~/stores/meetingsStore';
import type { CalendarTransaction } from '~/types/transactions';
import CreateMeetingModal from '~/components/CreateMeetingModal.vue';
import { formatCurrency } from '~/utils/formatCurrency';

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
  console.log('Группировка по дате:', grouped);

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
</script>

<template>
  <div class="calendar-block">
    <div class="calendar-header">
      <h4>Календарь платежей и событий</h4>
      <div class="header-controls">
        <div class="estate-selector">
          <label for="estate-select">Недвижимость:</label>
          <select id="estate-select" v-model="selectedEstateId">
            <option value="all">Все объекты</option>
            <option v-for="estate in userEstates" :key="estate.id" :value="estate.id">
              {{ estate.name }}
            </option>
          </select>
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
            <div class="stat-value">{{ formatCurrency(stats.totalIncome.toString()) }}</div>
          </div>
          <div class="stat-item expense">
            <div class="stat-label">Общий расход</div>
            <div class="stat-value">{{ formatCurrency(stats.totalExpense.toString()) }}</div>
          </div>
          <div
            class="stat-item balance"
            :class="{ positive: stats.balance >= 0, negative: stats.balance < 0 }"
          >
            <div class="stat-label">Остаток средств</div>
            <div class="stat-value">{{ formatCurrency(stats.balance.toString()) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="calendar-scroll-wrapper">
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
                    {{ formatCurrency(item.amount.toString()) }}
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
              <p class="operation-type">{{ getItemTypeText(selectedItem) }}</p>
            </div>
            <q-btn
              v-if="selectedItem.source === 'meeting'"
              icon="delete"
              flat
              round
              color="negative"
              @click="handleDeleteMeeting(selectedItem.id)"
            />
          </div>
        </q-card-section>

        <q-card-section class="modal-details">
          <div v-if="selectedItem.amount" class="detail-row">
            <span class="detail-label">Сумма:</span>
            <span class="detail-value" :class="getItemTypeClass(selectedItem)">
              {{ formatCurrency(selectedItem.amount.toString()) }}
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
          <q-btn flat label="Закрыть" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <CreateMeetingModal v-model="showCreateMeetingModal" @create="handleCreateMeeting" />
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
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color-light);
}

.stats-info {
  margin-bottom: 25px;
}

.stats-card {
  background: var(--bg-color-light);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px var(--box-shadow);
  border: 1px solid var(--border-color);
}

.stats-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

.stats-header h5 {
  margin: 0;
  color: var(--text-color-black);
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
  background: var(--bg-color);
  text-align: center;
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
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
  font-size: 12px;
  color: var(--label);
  font-weight: 500;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
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

.calendar-container {
  overflow-x: auto;
  overflow-y: hidden;
  background: var(--bg-color-light);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px var(--box-shadow);
}

.calendar-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: var(--bg-color);
  border-radius: 8px;
  color: var(--label);
}

:deep(.outlook-style .vc-day) {
  min-height: 120px;
  border: 1px solid var(--border-color);
  background: var(--bg-color-light);
}

:deep(.outlook-style .vc-day:not(.vc-disabled):hover) {
  background: var(--bg-color);
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
  color: var(--text-color-black);
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
  box-shadow: 0 2px 4px var(--box-shadow);
}

.event-line.income {
  background: var(--income-bg);
  border-left-color: var(--income-border);
}

.event-line.expense {
  background: var(--expense-bg);
  border-left-color: var(--expense-border);
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
  color: var(--income);
}

.event-line.expense .event-amount {
  color: var(--expense);
}

.event-modal {
  min-width: 400px;
  max-width: 500px;
}

.modal-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.operation-type {
  font-size: 14px;
  color: var(--label);
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
  color: var(--label);
  min-width: 100px;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
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
  line-height: 1.4;
  color: var(--label);
}
:deep(.vc-day:first-of-type) {
  margin-left: 0 !important;
}

:deep(.vc-day:last-of-type) {
  margin-right: 0 !important;
}

:deep(.on-left) {
  margin-right: 0 !important;
}

:deep(.on-right) {
  margin-left: 0 !important;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.event-icon {
  margin-right: 4px;
  font-size: 12px;
}

.calendar-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: var(--bg-color);
  border-radius: 8px;
  color: var(--label);
}

.loading-indicator {
  font-size: 12px;
  color: var(--label);
  font-style: italic;
}

.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
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
  }

  .estate-selector select {
    width: 120px;
    padding: 8px 0px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-color-light);
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
