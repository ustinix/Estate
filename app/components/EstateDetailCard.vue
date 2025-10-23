<script setup lang="ts">
import type { Estate } from '~/types/estate';

interface Props {
  estate: Estate;
  currentEstateType?: { name: string; icon: string } | null;
  hasRecoupment: boolean;
  hasDescription: boolean;
  onEdit: () => void;
}

defineProps<Props>();
</script>

<template>
  <div class="estate-card">
    <div class="card-content">
      <div class="card-header">
        <div class="main-info">
          <q-icon :name="currentEstateType?.icon || 'help'" size="md" color="green-9" />
          <div class="text-info">
            <div class="estate-type">{{ currentEstateType?.name || 'Тип не указан' }}</div>
            <h1 class="estate-title">{{ estate.name }}</h1>
          </div>
        </div>

        <div class="header-actions">
          <div v-if="hasRecoupment" class="recoupment-badge">
            <q-icon name="trending_up" size="xs" />
            <span>{{ estate.recoupment }}%</span>
          </div>
          <div v-else class="recoupment-placeholder">
            <q-icon name="insights" size="xs" />
            <span>Нет данных</span>
          </div>

          <q-btn round flat icon="more_vert" color="grey-6" size="sm" class="menu-btn">
            <q-menu>
              <q-list style="min-width: 120px">
                <q-item clickable v-close-popup @click="onEdit">
                  <q-item-section>Редактировать</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <div class="description-section">
        <div v-if="hasDescription" class="estate-description">
          {{ estate.description }}
        </div>
        <div v-else class="placeholder-card">
          <p>Описание пока не добавлено</p>
          <q-btn flat color="indigo-10" label="Добавить описание" icon="add" size="sm" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.estate-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-content {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.main-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.text-info {
  flex: 1;
}

.estate-type {
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
}

.estate-title {
  font-size: 18px;
  color: #333;
  margin: 0;
  font-weight: 600;
  line-height: 1.3;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recoupment-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #e8f5e8;
  color: #2e7d32;
  border-radius: 12px;
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
}

.recoupment-placeholder {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #f5f5f5;
  color: #666;
  border-radius: 12px;
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
}

.menu-btn {
  flex-shrink: 0;
}

.description-section {
  padding: 20px;
}

.estate-description {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin: 0;
}

.placeholder-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: #666;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .main-info {
    width: 100%;
  }
}
</style>
