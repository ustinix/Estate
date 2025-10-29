<script setup lang="ts">
import { useEstateStore } from '~/stores/estateStore';
import CalendarBlock from '~/components/CalendarBlock.vue';
import { useAuthStore } from '~/stores/authStore';

const authStore = useAuthStore();
const estateStore = useEstateStore();
const { estates } = storeToRefs(estateStore);
const userEstates = computed(() => estates.value ?? []);

if (authStore.user) {
  estateStore.getUserEstates(authStore.user.id);
}

watch(
  () => authStore.user,
  newUser => {
    if (newUser) {
      estateStore.getUserEstates(newUser.id);
    }
  },
);
</script>

<template>
  <section class="calendar-section">
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
    <div v-if="estates.length > 0"><CalendarBlock :user-estates="userEstates" /></div>
    <div v-else class="layout default-block-container">
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
