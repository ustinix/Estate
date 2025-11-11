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

watch(
  () => authStore.user,
  async newUser => {
    if (newUser) {
      await loadData();
    }
  },
);
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

      <div v-if="!authStore.isAuthenticated" class="layout default-block-container">
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

      <div
        v-else-if="authStore.isAuthenticated && userEstates.length === 0 && !isLoading"
        class="layout default-block-container"
      >
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

      <div v-else-if="isLoading" class="layout default-block-container">
        <div class="text-center q-pa-lg default-block">
          <div class="q-mt-md text-grey">Загрузка данных...</div>
        </div>
      </div>

      <div v-else-if="authStore.isAuthenticated && userEstates.length > 0">
        <CalendarBlock :user-estates="userEstates" :transactions="transactionsData" />
      </div>
    </ClientOnly>
  </section>
</template>
