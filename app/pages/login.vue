<script setup lang="ts">
import LoginForm from '~/components/LoginForm.vue';
</script>
<template>
  <section class="login-section layout">
    <LoginForm />
    <NuxtLink to="/register">
      <p class="text">Нет аккаунта? Зарегистрируйтесь!</p>
    </NuxtLink>
  </section>
</template>

<style scoped>
.login-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
