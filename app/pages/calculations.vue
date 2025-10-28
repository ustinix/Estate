<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore';

const authStore = useAuthStore();
</script>

<template>
  <section class="calculate-section">
    <div v-if="!authStore.isAuthenticated" class="layout default-block-container">
      <div class="text-center q-pa-lg default-block">
        <q-icon name="real_estate_agent" size="50px" color="grey" />
        <div class="q-mt-md text-grey">Расчёты не найдены</div>
        <NuxtLink to="/register">
          <q-btn
            color="secondary"
            label="Зарегистрируйтесь чтобы добавить первые расчёты"
            class="q-mt-md button"
          />
        </NuxtLink>
      </div>
    </div>
    <div v-else class="layout default-block-container">
      <div class="text-center q-pa-lg default-block">
        <p>Скоро тут будут калькуляторы для ваших расчётов</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.default-block-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  width: 100%;
}

.default-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 400px;
  width: 100%;
}
</style>
