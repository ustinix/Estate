<script setup lang="ts">
import { useQuasar } from 'quasar';
import type {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationSettings,
} from '~/types/auth';

const $q = useQuasar();
const { user, updateProfile, changePassword, getNotificationSettings, updateNotificationSettings } =
  useAuth();
const isLoading = ref(false);
const activeTab = ref('profile');

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

const notificationsData = ref<NotificationSettings>({
  emailNotifications: false,
  smsNotifications: false,
  telegramNotifications: false,
});

onMounted(async () => {
  await loadUserData();
  await loadNotifications();
});

async function loadUserData() {
  try {
    if (user.value) {
      profileData.value = {
        name: user.value.name,
        email: user.value.email,
        mobile: user.value.mobile || '',
        telegram: user.value.telegram || '',
      };
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: 'Ошибка загрузки данных профиля',
    });
  }
}

async function loadNotifications() {
  try {
    const settings = await getNotificationSettings();
    notificationsData.value = { ...settings };
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

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
        <q-form @submit="updateProfileData" class="q-gutter-md">
          <q-input filled v-model="profileData.name" label="Имя" hint="Ваше имя" />

          <q-input
            filled
            v-model="profileData.email"
            label="Email"
            hint="Электронная почта"
            type="email"
          />

          <q-input
            filled
            v-model="profileData.mobile"
            label="Телефон"
            hint="Номер телефона"
            mask="+# (###) ###-##-##"
          />

          <q-input
            filled
            v-model="profileData.telegram"
            label="Telegram"
            hint="Имя пользователя в Telegram"
            prefix="@"
          />

          <q-btn
            class="button"
            label="Сохранить изменения"
            type="submit"
            color="secondary"
            :loading="isLoading"
          />
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="password">
        <q-form @submit="changeUserPassword" class="q-gutter-md">
          <q-input
            filled
            v-model="passwordData.currentPassword"
            label="Текущий пароль"
            type="password"
          />

          <q-input
            filled
            v-model="passwordData.newPassword"
            label="Новый пароль"
            type="password"
            hint="Минимум 3 символа"
          />

          <q-btn
            class="button"
            label="Сменить пароль"
            type="submit"
            color="secondary"
            :loading="isLoading"
          />
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="notifications">
        <q-form @submit="changeNotificationSettings" class="q-gutter-md">
          <q-toggle v-model="notificationsData.emailNotifications" label="Email уведомления" />

          <q-toggle v-model="notificationsData.smsNotifications" label="SMS уведомления" />

          <q-toggle
            v-model="notificationsData.telegramNotifications"
            label="Telegram уведомления"
          />

          <q-btn
            class="button"
            label="Сохранить настройки"
            type="submit"
            color="secondary"
            :loading="isLoading"
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
