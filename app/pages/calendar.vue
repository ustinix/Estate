<script setup lang="ts">
import { useEstateStore } from '~/stores/estateStore';
import CalendarBlock from '~/components/CalendarBlock.vue';
import { useAuthStore } from '~/stores/authStore';
import { useTransactionsStore } from '~/stores/transactions';
import type { Estate } from '~/types/estate';
import type { CalendarTransaction } from '~/types/transactions';

const authStore = useAuthStore();
const estateStore = useEstateStore();
const transactionsStore = useTransactionsStore();

const { executeAsync, isLoading } = useErrorHandler();

const isMounted = ref(false);
const userEstates = ref<Estate[]>([]);
const transactionsData = ref<CalendarTransaction[]>([]);

const loadData = async (): Promise<void> => {
  await executeAsync(
    async () => {
      if (!authStore.user?.id) return;

      await Promise.all([
        estateStore.getUserEstates(authStore.user.id),
        transactionsStore.getUserTransactions(authStore.user.id),
      ]);

      userEstates.value = estateStore.estates || [];
      transactionsData.value = transactionsStore.userTransactions || [];
    },
    {
      showNotification: true,
      fallbackMessage: 'Не удалось загрузить данные',
    },
  );
};

onMounted(async () => {
  isMounted.value = true;
  if (authStore.isAuthenticated && authStore.user) {
    await loadData();
  }
});
</script>

<template>
  <section class="calendar-section">
    <ClientOnly>
      <template #fallback>
        <div class="layout default-block-container">
          <div class="text-center q-pa-lg default-block">
            <div class="q-mt-md text-grey">Загрузка...</div>
          </div>
        </div>
      </template>

      <div v-if="!authStore.isAuthenticated">
        <div class="text-center q-pa-lg default-block">
          <q-icon name="real_estate_agent" size="50px" color="grey" />
          <div class="q-mt-md text-grey">События не найдены</div>
          <NuxtLink to="/register">
            <q-btn
              color="secondary"
              label="Зарегистрируйтесь чтобы добавить первые события"
              class="q-mt-md button"
            />
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="authStore.isAuthenticated && userEstates.length === 0 && !isLoading">
        <div class="text-center q-pa-lg default-block">
          <NuxtLink to="/portfolio">
            <q-btn
              color="secondary"
              label="Добавьте вашу первую недвижимость"
              class="q-mt-md button"
            />
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="isLoading">
        <div class="text-center q-pa-lg default-block">
          <div class="q-mt-md text-grey">Загрузка данных...</div>
        </div>
      </div>

      <div v-else-if="authStore.isAuthenticated && userEstates.length > 0">
        <div class="calendar-wrapper">
          <CalendarBlock :user-estates="userEstates" :transactions="transactionsData" />
        </div>
      </div>
    </ClientOnly>
  </section>
</template>
<style scoped>
.calendar-section {
  width: 100%;
  min-height: 60vh;
  background: var(--bg-color);
}

.calendar-wrapper {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.default-block-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 60vh;
  padding: 40px 20px;
}

.default-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 400px;
  width: 100%;
  padding: 60px 40px;
  background: var(--bg-color-light);
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--box-shadow);
  border: 1px solid var(--border-color);
}
@media (max-width: 768px) {
  .calendar-wrapper {
    padding: 20px 15px;
  }

  .default-block-container {
    padding: 20px 15px;
  }

  .default-block {
    padding: 40px 20px;
  }
}

@media (max-width: 480px) {
  .calendar-wrapper {
    padding: 15px 10px;
  }

  .default-block-container {
    padding: 15px 10px;
  }

  .default-block {
    padding: 30px 20px;
  }
}
</style>
