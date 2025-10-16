<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { validateEmail, validatePassword } from '~/utils/validateRules';
import { visibilityStates, toggleVisibility } from '~/utils/toggleVisibility';
import type { LoginRequest } from '~/types/auth';

const $q = useQuasar();
const { login } = useAuth();

const isLoading = ref(false);
const errorMessage = ref('');

const formData = ref<LoginRequest>({
  email: '',
  password: '',
});

async function onSubmit() {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    const user = await login(formData.value);

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: `Добро пожаловать, ${user.name}!`,
    });
    await navigateTo('/profile');
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof Error) {
      errorMessage.value = error.message;

      $q.notify({
        color: 'red-5',
        textColor: 'white',
        icon: 'error',
        message: error.message,
      });
    }
  } finally {
    isLoading.value = false;
  }
}

function onReset() {
  formData.value = {
    email: '',
    password: '',
  };
  errorMessage.value = '';
}
</script>
<template>
  <section class="register-section q-pa-md">
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

      <div>
        <q-btn label="Войти" type="submit" color="secondary" class="button" />
        <q-btn label="Очистить" type="reset" color="secondary" flat class="q-ml-sm button" />
      </div>
    </q-form>
  </section>
</template>
<style lang="scss" scoped>
.register-section {
  min-width: 320px;
  max-width: 500px;
  margin: auto 0;
}
</style>
