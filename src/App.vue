<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function onLogout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <header class="header">
    <nav class="nav">
      <RouterLink to="/"> Каталог </RouterLink>
      <RouterLink to="/authors"> Авторы </RouterLink>
      <RouterLink to="/reports/top-authors"> Отчет </RouterLink>
    </nav>

    <div class="auth">
      <template v-if="auth.isAuthedUser">
        <span class="username">{{ auth.user?.username }}</span>
        <button @click="onLogout">Выйти</button>
      </template>

      <RouterLink v-else to="/login">Войти</RouterLink>
    </div>
  </header>

  <main class="container">
    <RouterView />
  </main>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.nav {
  display: flex;
  gap: 20px;
}

.nav a.router-link-active {
  color: var(--text);
  font-weight: 600;
}

.auth {
  display: flex;
  align-items: center;
  gap: 12px;
}
.username {
  color: var(--text-muted);
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}
</style>
