<script setup lang="ts">
const route = useRoute();
const authStore = useAuthStore();
const estateStore = useEstateStore();

const estateId = Number(route.params.id);
const userId = authStore.user?.id;

onMounted(async () => {
  if (userId && estateId) {
    await estateStore.getUserEstate(userId, estateId);
  }
});

const { estate, isLoading: pending, error } = storeToRefs(estateStore);

const goBack = () => {
  navigateTo('/portfolio');
};
</script>
<template>
  <div class="estate-page">
    <div v-if="pending" class="loading">Загрузка данных недвижимости...</div>
    <div v-else-if="error" class="error">
      <p>Ошибка: {{ error }}</p>
      <button @click="goBack" class="btn-back">← Назад к портфелю</button>
    </div>
    <div v-else-if="estate" class="estate-detail">
      <div class="back-button-container">
        <button @click="goBack" class="btn-back">← Назад</button>
      </div>
      <div class="estate-header">
        <q-icon :name="estate.estate_type_icon" size="lg" color="green-9" />
        <h1 class="estate-title">{{ estate.name }}</h1>
      </div>

      <div class="estate-content">
        <div class="estate-info">
          <p class="estate-description" v-if="estate.description">
            {{ estate.description }}
          </p>

          <div class="estate-meta">
            <div class="meta-item">
              <span class="label">Тип недвижимости:</span>
              <span class="value">{{ estate.estate_type_name || 'Не указан' }}</span>
            </div>

            <div class="meta-item" v-if="estate.recoupment">
              <span class="label">Окупаемость:</span>
              <span class="value">{{ estate.recoupment }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.estate-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
}

.back-button-container {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 20px;
}

.btn-back {
  min-width: 200px;
  background: none;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-back:hover {
  background: #f5f5f5;
}

.estate-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}
.title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}
.estate-title {
  font-size: 30px;
  color: #333;
}

.estate-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.estate-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.estate-info {
  flex: 1;
}

.estate-description {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 24px;
}

.estate-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: 500;
  color: #555;
}

.value {
  color: #333;
}

@media (max-width: 768px) {
  .estate-content {
    flex-direction: column;
  }

  .estate-icon {
    align-self: center;
  }
}
</style>
