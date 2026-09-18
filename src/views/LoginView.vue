<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { loginUser } = useAuthStore()
const router = useRouter()
const route = useRoute()

const error = ref('')
const isLoading = ref(false)

const formData = reactive({
  username: '',
  password: '',
})

async function submit() {
  isLoading.value = true
  try {
    await loginUser(formData.username, formData.password)
    router.push(route.query.redirect || '/')
  } catch (e) {
    error.value =
      e.response?.status === 401
        ? 'Неверный логин или пароль'
        : 'Не удалось войти, попробуйте ещё раз'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="login-form">
    <input type="text" placeholder="Логин" v-model="formData.username" required />
    <input type="password" placeholder="Пароль" v-model="formData.password" required />

    <button type="submit" :disabled="isLoading">Войти</button>

    <p v-if="error" class="form-error">{{ error }}</p>
  </form>
</template>

<style scoped>
.login-form {
  width: 360px;
  margin: 12vh auto 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}
</style>
