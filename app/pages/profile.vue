<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useAuthStore } from '~/stores/authStore';
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationSettingsRequest,
} from '~/types/auth';
import { visibilityStates, toggleVisibility } from '~/utils/toggleVisibility';

definePageMeta({
  middleware: 'auth',
  requiresAuth: true,
});

const $q = useQuasar();
const authStore = useAuthStore();

const activeTab = useLocalStorage('profile-active-tab', 'profile');
const isNotificationsLoading = ref(true);

const profileData = ref<UpdateProfileRequest>({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  mobile: authStore.user?.mobile || '',
  telegram: authStore.user?.telegram || '',
});

const passwordData = ref<ChangePasswordRequest>({
  currentPassword: '',
  newPassword: '',
});

const notificationsData = ref<NotificationSettingsRequest>({
  emailNotifications: false,
  smsNotifications: false,
  telegramNotifications: false,
});

watch(
  () => authStore.user,
  newUser => {
    if (newUser) {
      profileData.value = {
        name: newUser.name || '',
        email: newUser.email || '',
        mobile: newUser.mobile || '',
        telegram: newUser.telegram || '',
      };
    }
  },
  { immediate: true },
);

onMounted(async () => {
  try {
    const settings = await authStore.getNotificationSettings();
    notificationsData.value = { ...settings };
  } catch (error: unknown) {
    console.error('Error loading notifications:', error);
  } finally {
    isNotificationsLoading.value = false;
  }
});

async function updateProfileData() {
  try {
    await authStore.updateProfile(profileData.value);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Профиль успешно обновлен!',
    });
  } catch (error: unknown) {
    console.error('Profile update error:', error);
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: 'Ошибка обновления профиля',
    });
  }
}

async function changeUserPassword() {
  if (passwordData.value.newPassword.length < 3) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Пароль должен содержать минимум 3 символа',
    });
    return;
  }

  try {
    await authStore.changePassword(passwordData.value);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Пароль успешно изменен!',
    });

    passwordData.value = {
      currentPassword: '',
      newPassword: '',
    };
  } catch (error: unknown) {
    console.error('Password change error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка смены пароля';
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: message,
    });
  }
}

async function changeNotificationSettings() {
  try {
    await authStore.updateNotificationSettings(notificationsData.value);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Настройки уведомлений обновлены!',
    });
  } catch (error: unknown) {
    console.error('Notifications update error:', error);
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: 'Ошибка обновления настроек',
    });
  }
}
</script>
<template>
  <div class="profile-page q-pa-lg">
    <h4 class="q-mb-md">Личный кабинет</h4>

    <q-tabs v-model="activeTab" class="text-teal">
      <q-tab name="profile" icon="person" label="Профиль" />
      <q-tab name="password" icon="lock" label="Смена пароля" />
      <q-tab name="notifications" icon="notifications" label="Уведомления" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="profile">
        <q-form @submit="updateProfileData" class="q-gutter-md">
          <q-input filled v-model="profileData.name" label="Имя" :readonly="authStore.isLoading" />

          <q-input
            filled
            v-model="profileData.email"
            label="Email"
            type="email"
            :readonly="authStore.isLoading"
          />

          <q-input
            filled
            v-model="profileData.mobile"
            label="Телефон"
            mask="+# (###) ###-##-##"
            :readonly="authStore.isLoading"
          />

          <q-input
            filled
            v-model="profileData.telegram"
            label="Telegram"
            prefix="@"
            :readonly="authStore.isLoading"
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

      <q-tab-panel name="notifications">
        <div v-if="isNotificationsLoading" class="text-center q-pa-lg">
          <q-spinner size="50px" color="primary" />
          <div class="q-mt-md">Загрузка настроек...</div>
        </div>
        <q-form v-else @submit="changeNotificationSettings" class="q-gutter-md">
          <q-toggle
            v-model="notificationsData.emailNotifications"
            label="Email уведомления"
            :disabled="authStore.isLoading"
          />

          <q-toggle
            v-model="notificationsData.smsNotifications"
            label="SMS уведомления"
            :disabled="authStore.isLoading"
          />

          <q-toggle
            v-model="notificationsData.telegramNotifications"
            label="Telegram уведомления"
            :disabled="authStore.isLoading"
          />

          <q-btn
            class="button"
            label="Сохранить настройки"
            type="submit"
            color="secondary"
            :loading="authStore.isLoading"
            :disabled="authStore.isLoading"
          />
        </q-form>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<style scoped>
.profile-page {
  margin: 0 auto;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
