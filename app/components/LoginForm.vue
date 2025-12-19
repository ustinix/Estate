<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { validateEmail, validatePassword } from '~/utils/validateRules';
import { visibilityStates, toggleVisibility } from '~/utils/toggleVisibility';
import type { LoginRequest } from '~/types/auth';
import { useAuthStore } from '~/stores/authStore';
import { getUserNameFromEmail } from '~/utils/getUserName';
import { useErrorHandler } from '~/composables/useErrorHandler';

const authStore = useAuthStore();
const { showNotification, handleGenericError } = useErrorHandler();
const { isLoading } = storeToRefs(authStore);

const formData = ref<LoginRequest>({
  email: '',
  password: '',
});

async function onSubmit() {
  try {
    const tokenData = await authStore.login(formData.value);
    if (tokenData?.user) {
      const userName = tokenData.user.name
        ? tokenData.user.name
        : getUserNameFromEmail(formData.value.email);

      showNotification(`Добро пожаловать, ${userName}!`, 'success');
      await nextTick();
      await navigateTo('/profile');
    }
  } catch (error) {
    handleGenericError(error, 'Не удалось войти в систему');
  }
}

function onReset() {
  formData.value = {
    email: '',
    password: '',
  };
  clearError();
  visibilityStates.password = false;
}
</script>
<template>
  <section class="register-section q-pa-md">
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
        <q-btn label="Войти" type="submit" color="secondary" class="button" :loading="isLoading" />
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
