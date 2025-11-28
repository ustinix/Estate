<script setup lang="ts">
import { HOME_TEXT } from '~/constants/homePage';
import { useAuthStore } from '~/stores/authStore';

const authStore = useAuthStore();
</script>

<template>
  <div class="layout home-page">
    <section class="hero">
      <div class="container">
        <h1>{{ HOME_TEXT.hero.title }}</h1>
        <p>{{ HOME_TEXT.hero.subtitle }}</p>
        <div class="actions">
          <div v-if="!authStore.isAuthenticated">
            <NuxtLink to="/register">
              <q-btn class="hero-btn button" color="secondary" :label="HOME_TEXT.hero.btn" />
            </NuxtLink>
          </div>
          <div v-else>
            <NuxtLink to="/portfolio">
              <q-btn class="hero-btn button" color="secondary" :label="HOME_TEXT.hero.btn" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="benefits">
      <div class="container">
        <h2>{{ HOME_TEXT.benefits.title }}</h2>
        <div class="benefits-grid">
          <div
            v-for="benefit in HOME_TEXT.benefits.benefits"
            :key="benefit.title"
            class="benefit-card"
          >
            <div class="benefit-icon">
              <q-icon :name="benefit.icon" />
            </div>
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="preview">
      <div class="container">
        <h2>{{ HOME_TEXT.preview.title }}</h2>
        <div class="preview-image">
          <img src="~/assets/images/dashboard-preview.jpg" alt="Preview dashboard" />
        </div>
      </div>
    </section>
  </div>
</template>
<style lang="scss" scoped>
@keyframes changeColor {
  0% {
    border-color: transparent;
    opacity: 0;
  }
  100% {
    border-color: var(--border-color);
    opacity: 1;
  }
}

.hero {
  background: var(--bg-color-light);
  animation: changeColor 1.5s ease-in-out forwards;
  color: var(--text-color);
  padding: 3rem 2rem;
  border-radius: 16px;
  text-align: center;
  margin: 2rem 0;
  border: 2px solid transparent;
  box-shadow: var(--card-shadow);

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .hero-btn {
    font-size: 1rem;
    padding: 0.6rem 1rem;
    min-height: 2rem;
  }
}

.benefits {
  padding: 80px 0;
  background: var(--bg-color-light);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  h2 {
    text-align: center;
    color: var(--text-color);
    font-size: 2.5rem;
    margin-bottom: 3rem;
    font-weight: 600;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .benefit-card {
    background: var(--card-bg);
    padding: 2.5rem 2rem;
    border-radius: 16px;
    text-align: center;
    box-shadow: var(--card-shadow);
    border: 1px solid var(--border-color);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px var(--box-shadow);
    }

    .benefit-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, var(--primary), var(--income-border));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .q-icon {
        font-size: 2.5rem;
        color: white;
      }
    }

    h3 {
      color: var(--text-color);
      font-size: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    p {
      color: var(--text-color);
      opacity: 0.8;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.preview {
  padding: 80px 0;
  background: var(--bg-color);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
  }

  h2 {
    color: var(--text-color);
    font-size: clamp(1.5rem, 2.5vw, 2.5rem);
    line-height: 1.6;
    margin-bottom: 3rem;
    font-weight: 600;
  }

  .preview-image {
    max-width: 900px;
    margin: 0 auto;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 40px var(--box-shadow);
    border: 1px solid var(--border-color);

    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }
}
@media (max-width: 768px) {
  .hero {
    padding: 80px 0 60px;

    h1 {
      font-size: 2.25rem;
    }

    p {
      font-size: 1.125rem;
    }

    .actions {
      flex-direction: column;
      align-items: center;
    }
    .hero-btn {
      font-size: 1rem;
      padding: 0.6rem 1rem;
      min-height: 2rem;
    }
  }

  .benefits {
    padding: 60px 0;

    h2 {
      font-size: 2rem;
    }

    .benefits-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .benefit-card {
      padding: 2rem 1.5rem;
    }
  }

  .preview {
    padding: 60px 0;

    h2 {
      font-size: 2rem;
    }
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 1.875rem;
  }

  .benefits h2,
  .preview h2 {
    font-size: 1.75rem;
  }
}
</style>
