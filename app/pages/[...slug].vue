<script setup lang="ts"></script>

<template>
  <div class="error-page layout">
    <img class="error-page-img" src="../assets/images/404.jpg" alt="page not found" />
    <h2>Страница не существует</h2>
    <p>
      Мы не можем найти страницу, которую вы ищете. Возможно что-то не так с адресом страницы, или
      такая страница больше не существует.
    </p>
    <div class="button-container">
      <NuxtLink to="/">
        <q-btn class="button error-page-btn" color="secondary" label="На главную" />
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  h2 {
    font-size: clamp(2rem, 3vw, 3rem);
  }
  p {
    font-size: clamp(1rem, 1.5vw, 2rem);
  }
}
.error-page-img {
  max-width: 600px;
  width: 100%;
  height: auto;
}
.button-container {
  display: flex;
  justify-content: center;
}
.error-page-btn {
  font-size: 1.1rem;
  padding: 0.8rem 1.4rem;
  min-height: 2rem;
}
</style>
