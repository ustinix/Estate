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
    <CalendarBlock :user-estates="userEstates" />
  </section>
</template>

<style scoped></style>
