<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';
import type { EstateTransactionsFilters } from '~/types/transactions';
import { useErrorHandler } from '~/composables/useErrorHandler';

const { formatCurrencyForChart, formatDate } = useFormatters();

interface Props {
  userId: number;
  estateId: number;
}

const props = defineProps<Props>();
const store = useTransactionsStore();
const { executeAsync, clearError } = useErrorHandler();

const editDialog = ref(false);
const editingTransactionId = ref<number | null>(null);
const editForm = ref({
  sum: 0,
  date: '',
  comment: '',
});

const filters = ref<EstateTransactionsFilters>({
  page: 1,
  sort_by: 'date',
  sort_order: 'ASC',
});

const handleEditTransaction = (transaction: any) => {
  editingTransactionId.value = transaction.transaction_id;
  editForm.value = {
    sum: transaction.sum,
    date: transaction.date,
    comment: transaction.comment || '',
  };
  editDialog.value = true;
};

const handleSaveTransaction = async () => {
  const transactionId = editingTransactionId.value;
  if (!transactionId) return;

  await executeAsync(
    async () => {
      const updateData = {
        sum: Number(editForm.value.sum),
        date: editForm.value.date,
        comment: editForm.value.comment,
      };

      await store.updateEstateTransactions(props.userId, props.estateId, transactionId, updateData);

      editDialog.value = false;
      await loadTransactions(filters.value.page);
    },
    {
      showNotification: true,
      fallbackMessage: 'Не удалось обновить транзакцию',
    },
  );
};

const loadTransactions = async (page: number = 1) => {
  clearError();

  await executeAsync(
    async () => {
      await store.getUserEstateTransactions(props.userId, props.estateId, {
        ...filters.value,
        page,
      });
    },
    {
      fallbackMessage: 'Не удалось загрузить транзакции',
    },
  );
};

const handleDeleteTransaction = async (transactionId: number) => {
  await executeAsync(
    async () => {
      await store.deleteEstateTransactions(transactionId, props.userId, props.estateId);
      loadTransactions(filters.value.page);
    },
    {
      showNotification: true,
      fallbackMessage: 'Не удалось удалить транзакцию',
    },
  );
};

const handlePageChange = (page: number) => {
  filters.value.page = page;
  loadTransactions(page);
};

const handleFilterChange = () => {
  filters.value.page = 1;
  loadTransactions(1);
};

const handleSort = (field: string) => {
  if (filters.value.sort_by === field) {
    filters.value.sort_order = filters.value.sort_order === 'ASC' ? 'DESC' : 'ASC';
  } else {
    filters.value.sort_by = field;
    filters.value.sort_order = 'ASC';
  }

  filters.value.page = 1;
  loadTransactions(1);
};

const getSortIcon = (field: string) => {
  if (filters.value.sort_by !== field) return 'sort-inactive';
  return filters.value.sort_order === 'ASC' ? 'sort-asc' : 'sort-desc';
};
</script>

<template>
  <div class="transactions-table">
    <div class="filters-section">
      <div class="filter-group">
        <label>Направление:</label>
        <select v-model="filters.transaction_type_direction" @change="handleFilterChange">
          <option :value="undefined">Все</option>
          <option :value="true">Доход</option>
          <option :value="false">Расход</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Регулярность:</label>
        <select v-model="filters.transaction_type_regularity" @change="handleFilterChange">
          <option :value="undefined">Все</option>
          <option :value="true">Регулярные</option>
          <option :value="false">Разовые</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Дата с:</label>
        <input type="date" v-model="filters.date_start" @change="handleFilterChange" />
      </div>

      <div class="filter-group">
        <label>Дата по:</label>
        <input type="date" v-model="filters.date_end" @change="handleFilterChange" />
      </div>
    </div>

    <div class="table-container">
      <table v-if="!store.isLoading && store.userEstateTransactions.length">
        <thead>
          <tr>
            <th class="sortable" @click="handleSort('date')" :class="getSortIcon('date')">
              Дата <span class="sort-arrow"></span>
            </th>
            <th
              class="sortable"
              @click="handleSort('transaction_type_name')"
              :class="getSortIcon('transaction_type_name')"
            >
              Тип транзакции
              <span class="sort-arrow"></span>
            </th>
            <th class="sortable" @click="handleSort('sum')" :class="getSortIcon('sum')">
              Сумма <span class="sort-arrow"></span>
            </th>
            <th>Комментарий</th>
            <th class="actions-header">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in store.userEstateTransactions"
            :key="transaction.transaction_id"
            :class="{
              income: transaction.transaction_type_direction,
              expense: !transaction.transaction_type_direction,
            }"
          >
            <td>{{ formatDate(transaction.date) }}</td>
            <td>{{ transaction.transaction_type_name }}</td>
            <td :class="transaction.transaction_type_direction ? 'text-green' : 'text-red'">
              {{ formatCurrencyForChart(transaction.sum) }}
            </td>
            <td>{{ transaction.comment || '-' }}</td>
            <td class="actions-cell">
              <button
                class="edit-btn"
                @click="handleEditTransaction(transaction)"
                title="Редактировать транзакцию"
                :disabled="store.isLoading"
              >
                <q-icon name="edit" size="16px" />
              </button>
              <button
                class="delete-btn"
                @click="handleDeleteTransaction(transaction.transaction_id)"
                title="Удалить транзакцию"
                :disabled="store.isLoading"
              >
                <q-icon name="close" size="16px" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="store.isLoading" class="loading">Загрузка данных...</div>

      <div v-if="!store.isLoading && !store.userEstateTransactions.length" class="empty-state">
        Транзакции не найдены
      </div>
    </div>

    <div v-if="store.pagination.total_pages > 1" class="pagination">
      <button
        :disabled="store.pagination.page === 1 || store.isLoading"
        @click="handlePageChange(store.pagination.page - 1)"
        class="pagination-btn"
      >
        Назад
      </button>

      <span class="pagination-info">
        Страница {{ store.pagination.page }} из {{ store.pagination.total_pages }} (всего:
        {{ store.pagination.total_items }})
      </span>

      <button
        :disabled="store.pagination.page === store.pagination.total_pages || store.isLoading"
        @click="handlePageChange(store.pagination.page + 1)"
        class="pagination-btn"
      >
        Вперед
      </button>
    </div>
    <q-dialog v-model="editDialog" persistent>
      <q-card class="edit-dialog">
        <q-card-section class="dialog-header">
          <h6>Редактировать транзакцию</h6>
        </q-card-section>

        <q-card-section class="dialog-content">
          <div class="form-fields">
            <q-input
              filled
              v-model="editForm.sum"
              label="Сумма"
              type="number"
              :rules="[val => !!val || 'Введите сумму']"
              dense
            />
            <q-input
              filled
              v-model="editForm.date"
              label="Дата"
              type="date"
              :rules="[val => !!val || 'Введите дату']"
              dense
            />
            <q-input
              filled
              v-model="editForm.comment"
              label="Комментарий"
              type="textarea"
              rows="3"
              dense
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            label="Отмена"
            color="secondary"
            class="button"
            @click="editDialog = false"
            :disabled="store.isLoading"
          />
          <q-btn
            label="Сохранить"
            color="secondary"
            class="button"
            @click="handleSaveTransaction"
            :loading="store.isLoading"
            :disable="!editForm.sum || !editForm.date"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.transactions-table {
  max-width: 800px;
  padding-top: 2rem;
  width: 100%;
  margin: 0 auto;
}

.filters-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--label);
  height: 20px;
  display: flex;
  align-items: center;
}

.filter-group select {
  padding: 8px 28px 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-color-light);
  height: 36px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px;
}

.filter-group input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-color-light);
  height: 36px;
}

.table-container {
  min-height: 200px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: var(--bg-color);
  font-weight: 600;
  color: var(--text-color-black);
  font-size: 13px;
  white-space: nowrap;
  position: relative;
}
.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: var(--primary);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover:not(:disabled) {
  background: var(--primary-light);
}

.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: var(--label);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover:not(:disabled) {
  background: var(--expense-bg);
  color: var(--expense);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  padding-right: 30px !important;
}

.sortable:hover {
  background-color: var(--bg-color-light);
}

.sort-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  transition: all 0.2s;
}

.sort-inactive .sort-arrow {
  border-top: 4px solid #ccc;
  border-bottom: none;
}

.sort-asc .sort-arrow {
  border-bottom: 4px solid var(--primary);
  border-top: none;
}

.sort-desc .sort-arrow {
  border-top: 4px solid var(--primary);
  border-bottom: none;
}

.income {
  background-color: var(--income-bg);
}

.expense {
  background-color: var(--expense-bg);
}

.text-green {
  color: var(--income);
  font-weight: 600;
}

.text-red {
  color: var(--expense);
  font-weight: 600;
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--label);
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 1rem;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-color-light);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.pagination-btn:hover:not(:disabled) {
  background: var(--bg-color);
  border-color: var(--border-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 13px;
  color: var(--label);
  text-align: center;
}
.edit-dialog {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
}

.dialog-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  background: var(--bg-color);
  border-radius: 12px 12px 0 0;
}

.dialog-header h6 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color-black);
}

.dialog-content {
  padding: 20px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-actions {
  padding: 16px 20px 20px;
  border-top: 1px solid var(--border-color);
  gap: 8px;
  background: var(--bg-color-light);
  border-radius: 0 0 12px 12px;
}

@media (max-width: 768px) {
  .transactions-table {
    padding-top: 1rem;
    max-width: 100%;
  }

  .filters-section {
    gap: 12px;
    margin-bottom: 16px;
  }

  .filter-group {
    min-width: calc(50% - 12px);
    flex: none;
  }

  .filter-group label {
    font-size: 11px;
  }

  .filter-group select,
  .filter-group input {
    padding: 6px 10px;
    font-size: 13px;
  }

  table {
    font-size: 13px;
  }

  th,
  td {
    padding: 8px 6px;
  }

  th {
    font-size: 12px;
  }

  .sortable {
    padding-right: 25px !important;
  }

  .sort-arrow {
    right: 8px;
  }

  .actions-cell {
    gap: 4px;
  }

  .edit-btn,
  .delete-btn {
    padding: 4px;
  }

  .pagination {
    gap: 12px;
  }

  .pagination-info {
    font-size: 10px;
    margin-bottom: 8px;
  }

  .pagination-btn {
    padding: 6px 12px;
    font-size: 10px;
  }
  .edit-dialog {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }

  .dialog-content {
    padding: 16px;
  }

  .form-fields {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .transactions-table {
    padding: 0.5rem;
  }

  .filters-section {
    gap: 8px;
  }

  .filter-group {
    min-width: 100%;
  }

  table {
    font-size: 12px;
  }

  th,
  td {
    padding: 6px 4px;
  }

  th {
    font-size: 11px;
  }

  .sortable {
    padding-right: 20px !important;
  }

  .sort-arrow {
    right: 6px;
  }

  .loading,
  .empty-state {
    padding: 20px;
    font-size: 13px;
  }
}

@media (max-width: 360px) {
  .transactions-table {
    padding: 0.25rem;
  }

  table {
    font-size: 11px;
  }

  th,
  td {
    padding: 4px 3px;
  }
  .edit-dialog {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }

  .dialog-content {
    padding: 12px;
  }

  .actions-cell {
    flex-direction: column;
    gap: 2px;
  }

  .edit-btn,
  .delete-btn {
    margin: 0;
  }
}
@media (max-width: 360px) {
  .transactions-table {
    padding: 0.25rem;
  }

  table {
    font-size: 11px;
  }

  th,
  td {
    padding: 4px 3px;
  }
}
</style>
