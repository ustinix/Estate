isLoading
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { validateEmail, validatePassword } from '~/utils/validateRules';
import { visibilityStates, toggleVisibility } from '~/utils/toggleVisibility';
import { useAuthStore } from '~/stores/authStore';
import { getUserNameFromEmail } from '~/utils/getUserName';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { isLoading } = storeToRefs(authStore);
const $q = useQuasar();
const errorMessage = ref('');

const formData = ref({
  email: '',
  password: '',
  confirmPassword: '',
});

const validateConfirmPassword = (val: string) => {
  return val === formData.value.password || 'Пароли не совпадают';
};

async function onSubmit() {
  errorMessage.value = '';

  try {
    const response = await authStore.register({
      email: formData.value.email,
      password: formData.value.password,
    });

    await authStore.initAuth();

    const userName = response?.user?.name
      ? response.user.name
      : getUserNameFromEmail(formData.value.email);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: `Регистрация успешна! Добро пожаловать, ${userName}!`,
    });
    await nextTick();
    await navigateTo('/profile');
  } catch (error) {
    console.error('Registration error:', error);

    let message = 'Ошибка регистрации';

    if (error instanceof Error) {
      message = error.message;
    }
    errorMessage.value = message;

    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: message,
    });
  }
}

function onReset() {
  formData.value = {
    email: '',
    password: '',
    confirmPassword: '',
  };
  errorMessage.value = '';
  visibilityStates.password = false;
  visibilityStates.confirmPassword = false;
}
</script>
<template>
  <div class="register-form q-pa-md">
    <div v-if="errorMessage" class="error-message q-mb-md">
      <q-icon name="error" color="red" />
      {{ errorMessage }}
    </div>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="formData.email"
        label="Электронная почта *"
        hint="example@mail.ru"
        lazy-rules
        :rules="[val => (val && val.length > 0) || 'Введите email адрес', validateEmail]"
      />

      <q-input
        filled
        v-model="formData.password"
        :type="visibilityStates.password ? 'text' : 'password'"
        label="Пароль *"
        hint="Минимум 3 символа"
        lazy-rules
        :rules="[val => (val && val.length > 0) || 'Введите пароль', validatePassword]"
      >
        <template v-slot:append>
          <q-icon
            :name="visibilityStates.password ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="toggleVisibility('password')"
          />
        </template>
      </q-input>

      <q-input
        filled
        v-model="formData.confirmPassword"
        :type="visibilityStates.confirmPassword ? 'text' : 'password'"
        label="Подтверждение пароля *"
        lazy-rules
        :rules="[val => (val && val.length > 0) || 'Повторите пароль', validateConfirmPassword]"
      >
        <template v-slot:append>
          <q-icon
            :name="visibilityStates.confirmPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="toggleVisibility('confirmPassword')"
          />
        </template>
      </q-input>

      <div>
        <q-btn
          label="Зарегистрироваться"
          type="submit"
          color="secondary"
          class="button"
          :loading="isLoading"
        />
        <q-btn label="Очистить" type="reset" color="secondary" flat class="q-ml-sm button" />
      </div>
    </q-form>
  </div>
</template>
<style lang="scss" scoped>
.register-form {
  max-width: 500px;
  margin: auto 0;
}
</style>
