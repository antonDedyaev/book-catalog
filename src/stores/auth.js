import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthedUser = computed(() => !!token.value && user.value?.role === 'user')

  async function loginUser(username, password) {
    const data = await login(username, password)

    token.value = data.token
    user.value = data.user

    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isAuthedUser, loginUser, logout }
})
