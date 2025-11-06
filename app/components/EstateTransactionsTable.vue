<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';
import type { EstateTransactionsFilters } from '~/types/transactions';

interface Props {
  userId: number;
  estateId: number;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
});

const store = useTransactionsStore();

const filters = ref<EstateTransactionsFilters>({
  limit: props.pageSize,
  offset: 0,
});

const loadTransactions = async (page: number = 1) => {
  try {
    const offset = (page - 1) * (filters.value.limit || props.pageSize);

    await store.getUserEstateTransactions(props.userId, props.estateId, {
      ...filters.value,
      offset,
      limit: filters.value.limit || props.pageSize,
    });
  } catch (error) {
    console.error('Ошибка загрузки транзакций:', error);
  }
};

const handlePageChange = (page: number) => {
  loadTransactions(page);
};

const handleFilterChange = () => {
  loadTransactions(1);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const formatCurrency = (amount: string) => {
  const number = parseFloat(amount);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(number);
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
        <input type="date" v-model="filters.start_date" @change="handleFilterChange" />
      </div>

      <div class="filter-group">
        <label>Дата по:</label>
        <input type="date" v-model="filters.end_date" @change="handleFilterChange" />
      </div>
    </div>

    <div class="table-container">
      <table v-if="!store.isLoading && store.userEstateTransactions.length">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип транзакции</th>
            <th>Сумма</th>
            <th>Комментарий</th>
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
              {{ formatCurrency(transaction.sum) }}
            </td>
            <td>{{ transaction.comment || '-' }}</td>
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
  color: #666;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
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
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
  font-size: 13px;
  white-space: nowrap;
}

.income {
  background-color: #f0f9f0;
}

.expense {
  background-color: #fef0f0;
}

.text-green {
  color: #22c55e;
  font-weight: 600;
}

.text-red {
  color: #ef4444;
  font-weight: 600;
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
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
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 13px;
  color: #6b7280;
  text-align: center;
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
}
</style>
