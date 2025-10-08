<script setup lang="ts">
import { FOOTER_PAGE } from '~/constants/footer';
</script>
<template>
  <footer class="footer">
    <div class="footer-content">
      <NuxtLink to="/" class="footer-section">
        <h3 class="footer-title">{{ FOOTER_PAGE.title }}</h3>
        <p class="footer-subtitle">{{ FOOTER_PAGE.subtitle }}</p>
      </NuxtLink>

      <div class="footer-section">
        <h4 class="section-title">{{ FOOTER_PAGE.contactsTitle }}</h4>
        <div class="social-links">
          <NuxtLink
            v-for="navLink in FOOTER_PAGE.socialNetworks"
            :key="navLink.name"
            :to="navLink.url"
            :title="navLink.name"
            class="social-link"
          >
            <q-icon :name="navLink.icon" class="social-icon" />
            <span class="social-text">{{ navLink.name }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="footer-section">
        <h4 class="section-title">{{ FOOTER_PAGE.resource.title }}</h4>
        <div class="resource-links">
          <NuxtLink
            v-for="link in FOOTER_PAGE.resource.resoures"
            :key="link.name"
            :to="link.href"
            :title="link.name"
            class="resource-link"
          >
            <span class="social-text">{{ link.name }}</span></NuxtLink
          >
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy;{{ FOOTER_PAGE.bottomText }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--bg-color);
  color: var(--text-color);
  padding: 2rem 1rem 1rem;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;

  .section-title {
    margin-bottom: 1.25rem;
    color: var(--text-color-light);
    font-size: 1.3rem;
    font-weight: 600;
  }
}

.footer-title {
  color: var(--primary);
  font-size: clamp(1.5rem, 2vw, 2rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.footer-subtitle {
  color: var(--text-color);
  font-size: clamp(0.9rem, 1vw, 1.1rem);
  font-weight: 400;
  line-height: 1.5;
  opacity: 0.8;
}
.social-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-color-light);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  border-radius: 6px;

  &:hover {
    color: var(--primary);
    transform: translateX(4px);
  }
}

.social-icon {
  font-size: 1.25rem;
  width: 24px;
  flex-shrink: 0;
}

.social-text {
  font-size: 0.95rem;
  font-weight: 500;
}

.resource-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resource-link {
  color: var(--text-color-light);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  border-radius: 6px;
  font-size: 0.95rem;

  &:hover {
    color: var(--primary);
    padding-left: 8px;
  }
}

.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;

  p {
    color: var(--text-color-light);
    font-size: 0.9rem;
    opacity: 0.7;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 1.5rem 1rem 1rem;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-section {
    text-align: center;

    .section-title {
      margin-bottom: 1rem;
    }
  }

  .social-links,
  .resource-links {
    align-items: center;
  }

  .social-link {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 1rem 0.75rem 0.75rem;
  }

  .footer-content {
    gap: 1.5rem;
  }
}
</style>
