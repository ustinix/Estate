<script setup lang="ts">
import { ref } from 'vue';
import { validateEmail, validatePassword } from '~/utils/validateRules';
import { visibilityStates, toggleVisibility } from '~/utils/toggleVisibility';

const email = ref<string>('');
const password = ref<string>('');

function onSubmit() {
  // Сюда добавить отправку данных на сервер
}

function onReset() {
  email.value = '';
  password.value = '';
}
</script>
<template>
  <section class="register-section q-pa-md">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="email"
        label="Электронная почта *"
        hint="example@mail.ru"
        lazy-rules
        :rules="[val => (val && val.length > 0) || 'Введите email адрес', validateEmail]"
      />

      <q-input
        filled
        v-model="password"
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
