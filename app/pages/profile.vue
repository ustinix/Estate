<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore';
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationSettingsRequest,
} from '~/types/auth';
import { visibilityStates, toggleVisibility } from '~/utils/toggleVisibility';
import { validateOptionalName, validateOptionalPhone } from '~/utils/validateRules';
import { useErrorHandler } from '#imports';

const { formatPhone } = useFormatters();
const { handleGenericError, showNotification } = useErrorHandler();

definePageMeta({
  middleware: 'auth',
  requiresAuth: true,
});

const authStore = useAuthStore();
const activeTab = ref('profile');
const isNotificationsLoading = ref(true);
const userId = computed(() => authStore.user?.id);
const userEmail = computed(() => authStore.user?.email);

const editableProfileData = ref<UpdateProfileRequest>({
  name: '',
  phone: '',
});

const passwordData = ref<ChangePasswordRequest>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const notificationsData = ref<NotificationSettingsRequest>({
  emailNotifications: false,
  smsNotifications: false,
});

watchEffect(() => {
  if (authStore.user) {
    editableProfileData.value = {
      name: authStore.user.name || '',
      phone: authStore.user.phone || '',
    };
  }
});

const loadNotificationSettings = async () => {
  try {
    const settings = await authStore.getNotificationSettings();
    notificationsData.value = { ...settings };
  } catch (error: unknown) {
    handleGenericError(error, 'Ошибка загрузки настроек');
  } finally {
    isNotificationsLoading.value = false;
  }
};

loadNotificationSettings();

async function updateProfileData() {
  if (!userId.value) {
    showNotification('Ошибка: пользователь не найден', 'error');
    return;
  }

  try {
    const formattedData = {
      ...editableProfileData.value,
      phone: formatPhone(editableProfileData.value.phone),
    };
    await authStore.updateProfile(userId.value, formattedData);
    showNotification('Профиль успешно обновлен!', 'success');
  } catch (error: unknown) {
    handleGenericError(error, 'Ошибка обновления профиля');
  }
}

async function changeUserPassword() {
  if (passwordData.value.newPassword.length < 3) {
    showNotification('Пароль должен содержать минимум 3 символа', 'warning');
    return;
  }
  if (!userId.value) {
    showNotification('Пользователь не авторизован', 'warning');
    return;
  }

  try {
    await authStore.changePassword(passwordData.value, userId.value);

    showNotification('Пароль успешно изменен!', 'success');

    passwordData.value = {
      currentPassword: '',
      newPassword: '',
    };
  } catch (error: unknown) {
    handleGenericError(error, 'Ошибка смены пароля');
  }
}

async function changeNotificationSettings() {
  try {
    await authStore.updateNotificationSettings(notificationsData.value);
    showNotification('Настройки уведомлений обновлены!', 'success');
  } catch (error: unknown) {
    handleGenericError(error, 'Ошибка обновления настроек');
  }
}
const validateConfirmPassword = (val: string) => {
  return val === passwordData.value.newPassword || 'Пароли не совпадают';
};
</script>
<template>
  <ClientOnly>
    <div class="profile-page q-pa-lg">
      <h4 class="q-mb-md">Личный кабинет</h4>

      <q-tabs
        v-model="activeTab"
        active-color="indigo-10"
        indicator-color="indigo-10"
        class="responsive-tabs"
      >
        <q-tab name="profile" icon="person" label="Профиль" />
        <q-tab name="password" icon="lock" label="Смена пароля" />
        <q-tab name="notifications" icon="notifications" label="Уведомления" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="profile">
          <q-form @submit="updateProfileData" class="q-gutter-md">
            <q-input
              filled
              v-model="editableProfileData.name"
              label="Имя"
              :readonly="authStore.isLoading"
              :rules="[validateOptionalName]"
            />

            <q-input
              filled
              v-model="userEmail"
              label="Email"
              type="email"
              :readonly="authStore.isLoading"
              disable
              hint="Email нельзя изменить"
            />

            <q-input
              filled
              v-model="editableProfileData.phone"
              label="Телефон"
              mask="+# (###) ###-##-##"
              :readonly="authStore.isLoading"
              :rules="[validateOptionalPhone]"
            />

            <q-btn
              class="button"
              label="Сохранить изменения"
              type="submit"
              color="secondary"
              :loading="authStore.isLoading"
              :disabled="authStore.isLoading"
            />
          </q-form>
        </q-tab-panel>

        <q-tab-panel name="password">
          <q-form @submit="changeUserPassword" class="q-gutter-md">
            <q-input
              filled
              v-model="passwordData.currentPassword"
              label="Текущий пароль"
              :readonly="authStore.isLoading"
              :type="visibilityStates.currentPassword ? 'text' : 'password'"
            >
              <template v-slot:append>
                <q-icon
                  :name="visibilityStates.currentPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="toggleVisibility('currentPassword')"
                />
              </template>
            </q-input>

            <q-input
              filled
              v-model="passwordData.newPassword"
              label="Новый пароль"
              hint="Минимум 3 символа"
              :readonly="authStore.isLoading"
              :type="visibilityStates.newPassword ? 'text' : 'password'"
            >
              <template v-slot:append>
                <q-icon
                  :name="visibilityStates.newPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="toggleVisibility('newPassword')"
                />
              </template>
            </q-input>
            <q-input
              filled
              v-model="passwordData.confirmPassword"
              :type="visibilityStates.confirmPassword ? 'text' : 'password'"
              label="Подтверждение пароля"
              lazy-rules
              :rules="[
                val => (val && val.length > 0) || 'Повторите пароль',
                validateConfirmPassword,
              ]"
            >
              <template v-slot:append>
                <q-icon
                  :name="visibilityStates.confirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="toggleVisibility('confirmPassword')"
                />
              </template>
            </q-input>

            <q-btn
              class="button"
              label="Сменить пароль"
              type="submit"
              color="secondary"
              :loading="authStore.isLoading"
              :disabled="authStore.isLoading"
            />
          </q-form>
        </q-tab-panel>

        <q-tab-panel name="notifications" class="notification-container">
          <div v-if="isNotificationsLoading" class="text-center q-pa-lg">
            <q-spinner size="50px" color="primary" />
            <div class="q-mt-md">Загрузка настроек...</div>
          </div>
          <q-form v-else @submit="changeNotificationSettings" class="notification-form">
            <div class="form-content">
              <q-toggle
                v-model="notificationsData.emailNotifications"
                label="Email уведомления"
                class="q-mb-md"
              />

              <q-toggle
                v-model="notificationsData.smsNotifications"
                label="SMS уведомления"
                class="q-mb-md"
              />
            </div>

            <div class="form-actions">
              <q-btn
                class="button"
                label="Сохранить настройки"
                type="submit"
                color="secondary"
                :loading="authStore.isLoading"
                :disabled="authStore.isLoading"
              />
            </div>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </ClientOnly>
</template>

<style scoped>
.profile-page {
  margin: 0 auto;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.notification-form {
  margin-top: 2rem;
  display: flex;
  gap: 20px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.form-content {
  flex: 1;
  padding: 0 16px;
}

.form-actions {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  background: white;
  text-align: center;
}

@media (max-width: 768px) {
  :deep(.q-tabs) {
    padding: 0;
    gap: 1px;
  }
  :deep(.q-tab__label) {
    font-size: 10px;
  }

  :deep(.q-tab__icon) {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  :deep(.q-tab__label) {
    font-size: 9px;
  }

  :deep(.q-tab__icon) {
    font-size: 16px;
  }
}
</style>
