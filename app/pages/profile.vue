<script setup lang="ts">
import { useQuasar } from 'quasar';
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
const {
  user,
  updateProfile,
  changePassword,
  getNotificationSettings,
  updateNotificationSettings,
  isLoading,
} = useAuth();

const activeTab = useLocalStorage('profile-active-tab', 'profile');
const isProfileLoading = ref(true);
const isNotificationsLoading = ref(true);

const profileData = ref<UpdateProfileRequest>({
  name: '',
  email: '',
  mobile: '',
  telegram: '',
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
  user,
  newUser => {
    if (newUser && isProfileLoading.value) {
      profileData.value = {
        name: newUser.name || '',
        email: newUser.email || '',
        mobile: newUser.mobile || '',
        telegram: newUser.telegram || '',
      };
      isProfileLoading.value = false;
    }
  },
  { immediate: true },
);

watch(
  [user, isLoading],
  async ([newUser, newIsLoading]) => {
    if (newUser && !newIsLoading && isNotificationsLoading.value) {
      try {
        const settings = await getNotificationSettings();
        notificationsData.value = { ...settings };
        isNotificationsLoading.value = false;
      } catch (error) {
        console.error('Error loading notifications:', error);
        isNotificationsLoading.value = false;
      }
    }
  },
  { immediate: true },
);

async function updateProfileData() {
  try {
    await updateProfile(profileData.value);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Профиль успешно обновлен!',
    });
  } catch (error) {
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
    await changePassword(passwordData.value);

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
  } catch (error: any) {
    console.error('Password change error:', error);
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: error.message || 'Ошибка смены пароля',
    });
  }
}

async function changeNotificationSettings() {
  try {
    await updateNotificationSettings(notificationsData.value);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Настройки уведомлений обновлены!',
    });
  } catch (error) {
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
        <div v-if="isProfileLoading" class="text-center q-pa-lg">
          <q-spinner size="50px" color="primary" />
          <div class="q-mt-md">Загрузка профиля...</div>
        </div>
        <q-form v-else @submit="updateProfileData" class="q-gutter-md">
          <q-input filled v-model="profileData.name" label="Имя" :readonly="isLoading" />

          <q-input
            filled
            v-model="profileData.email"
            label="Email"
            type="email"
            :readonly="isLoading"
          />

          <q-input
            filled
            v-model="profileData.mobile"
            label="Телефон"
            mask="+# (###) ###-##-##"
            :readonly="isLoading"
          />

          <q-input
            filled
            v-model="profileData.telegram"
            label="Telegram"
            prefix="@"
            :readonly="isLoading"
          />

          <q-btn
            class="button"
            label="Сохранить изменения"
            type="submit"
            color="secondary"
            :loading="isLoading"
            :disable="isLoading"
          />
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="password">
        <q-form @submit="changeUserPassword" class="q-gutter-md">
          <q-input
            filled
            v-model="passwordData.currentPassword"
            label="Текущий пароль"
            :readonly="isLoading"
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
            :readonly="isLoading"
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
            :loading="isLoading"
            :disable="isLoading"
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
            :disable="isLoading"
          />

          <q-toggle
            v-model="notificationsData.smsNotifications"
            label="SMS уведомления"
            :disable="isLoading"
          />

          <q-toggle
            v-model="notificationsData.telegramNotifications"
            label="Telegram уведомления"
            :disable="isLoading"
          />

          <q-btn
            class="button"
            label="Сохранить настройки"
            type="submit"
            color="secondary"
            :loading="isLoading"
            :disable="isLoading"
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
