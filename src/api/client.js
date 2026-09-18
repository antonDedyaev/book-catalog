import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: '/api/v1',
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      // Динамический импорт используется, чтобы избежать циклического импорта
      import('@/stores/auth').then(({ useAuthStore }) => {
        useAuthStore().logout()
        router.push('/login')
      })
    }

    return Promise.reject(error)
  },
)

export default api
