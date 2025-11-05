<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';

const props = defineProps<{
  userId: number;
  estateId: number;
}>();

const transactionsStore = useTransactionsStore();
const { userEstateTransactions, isLoading, error } = storeToRefs(transactionsStore);

const currentPage = ref(1);
const itemsPerPage = ref(10);

const allTransactions = computed(() => userEstateTransactions.value);

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return allTransactions.value.slice(start, end);
});

const totalPages = computed(() => {
  if (allTransactions.value.length === 0) return 0;
  return Math.ceil(allTransactions.value.length / itemsPerPage.value);
});

const displayedRecordsInfo = computed(() => {
  if (allTransactions.value.length === 0) return '';

  const start = (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(currentPage.value * itemsPerPage.value, allTransactions.value.length);

  return `Показано ${start}-${end} из ${allTransactions.value.length} транзакций`;
});

const loadTransactions = async () => {
  await transactionsStore.getUserEstateTransactions(props.userId, props.estateId);
  currentPage.value = 1;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

onMounted(() => {
  loadTransactions();
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const formatSum = (sum: string) => {
  return parseFloat(sum).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
</script>

<template>
  <div class="estate-transactions-table">
    <div class="table-header">
      <h6>Транзакции</h6>
      <div class="pagination-controls" v-if="totalPages > 1 && !isLoading && !error">
        <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">←</button>

        <span class="pagination-info"> Страница {{ currentPage }} из {{ totalPages }} </span>

        <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
          →
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Загрузка транзакций...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <table v-else class="transactions-table">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Тип</th>
          <th>Сумма</th>
          <th>Комментарий</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="transaction in paginatedTransactions"
          :key="transaction.transaction_id"
          :class="{
            income: transaction.transaction_type_direction,
            expense: !transaction.transaction_type_direction,
          }"
        >
          <td>{{ formatDate(transaction.date) }}</td>
          <td>{{ transaction.transaction_type_name }}</td>
          <td
            :class="{
              'amount-income': transaction.transaction_type_direction,
              'amount-expense': !transaction.transaction_type_direction,
            }"
          >
            {{ transaction.transaction_type_direction ? '+' : '-' }}{{ formatSum(transaction.sum) }}
          </td>
          <td class="comment">{{ transaction.comment || '-' }}</td>
        </tr>
      </tbody>
    </table>

    <div class="records-info" v-if="!isLoading && !error && allTransactions.length > 0">
      {{ displayedRecordsInfo }}
    </div>

    <div v-if="!isLoading && !error && allTransactions.length === 0" class="no-data">
      Транзакции не найдены
    </div>
  </div>
</template>

<style scoped>
.estate-transactions-table {
  margin: 20px 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  h6 {
    margin: 20px;
  }
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.pagination-btn {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.records-info {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #6c757d;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.income {
  border-left: 3px solid #10b981;
}

.expense {
  border-left: 3px solid #ef4444;
}

.amount-income {
  color: #10b981;
  font-weight: bold;
}

.amount-expense {
  color: #ef4444;
  font-weight: bold;
}

.comment {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.transactions-table th,
.transactions-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.transactions-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.loading,
.error-message,
.no-data {
  text-align: center;
  padding: 40px;
  margin: 20px 0;
}

.error-message {
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
}

.no-data {
  color: #6b7280;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .pagination-controls {
    align-self: stretch;
    justify-content: center;
  }

  .transactions-table {
    font-size: 10px;
  }

  .transactions-table th,
  .transactions-table td {
    padding: 8px 6px;
  }
}
</style>
