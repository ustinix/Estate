<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { validateEmail, validatePassword } from '~/utils/validateRules';
import { visibilityStates, toggleVisibility } from '~/utils/toggleVisibility';
import type { RegisterRequest } from '~/types/auth';

const $q = useQuasar();
const { register } = useAuth();

const isLoading = ref(false);

const formData = ref<RegisterRequest>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  accept: false,
});

const validateConfirmPassword = (val: string) => {
  return val === formData.value.password || 'Пароли не совпадают';
};

async function onSubmit() {
  if (formData.value.accept !== true) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Необходимо согласие с условиями обработки персональных данных',
    });
    return;
  }

  isLoading.value = true;

  try {
    const user = await register(formData.value);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: `Регистрация успешна! Добро пожаловать, ${user.name}!`,
    });

    await navigateTo('/profile');
  } catch (error) {
    console.error('Registration error:', error);
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'error',
      message: 'Ошибка регистрации. Попробуйте еще раз.',
    });
  } finally {
    isLoading.value = false;
  }
}

function onReset() {
  formData.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accept: false,
  };
  visibilityStates.value.password = false;
  visibilityStates.value.confirmPassword = false;
}
</script>
<template>
  <div class="register-form q-pa-md">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="formData.name"
        label="Ваше имя *"
        hint="Имя должно содержать минимум 3 буквы"
        lazy-rules
        :rules="[val => (val && val.length >= 3) || 'Имя должно содержать минимум 3 буквы']"
      />

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

      <q-toggle
        v-model="formData.accept"
        label="Соглашаюсь на обработку персональных данных в соответствии с политикой конфиденциальности"
      />

      <div>
        <q-btn label="Зарегистрироваться" type="submit" color="secondary" class="button" />
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
