<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { validateEmail, validatePassword } from '~/utils/validateRules';
import { visibilityStates, toggleVisibility } from '~/utils/toggleVisibility';

const $q = useQuasar();
const name = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');
const accept = ref<boolean>(false);

const validateConfirmPassword = (val: string) => {
  return val === password.value || 'Пароли не совпадают';
};

function onSubmit() {
  if (accept.value !== true) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Необходимо согласие с условиями обработки персональных данных',
    });
    return;
  }

  // Сюда добавить отправку данных на сервер
  $q.notify({
    color: 'green-4',
    textColor: 'white',
    icon: 'cloud_done',
    message: 'Регистрация успешна!',
  });
}

function onReset() {
  name.value = '';
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  accept.value = false;
  visibilityStates.value.password = false;
  visibilityStates.value.confirmPassword = false;
}
</script>
<template>
  <div class="register-form q-pa-md">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="name"
        label="Ваше имя *"
        hint="Имя должно содержать минимум 3 буквы"
        lazy-rules
        :rules="[val => (val && val.length >= 3) || 'Имя должно содержать минимум 3 буквы']"
      />

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

      <q-input
        filled
        v-model="confirmPassword"
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
        v-model="accept"
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
