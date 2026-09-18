<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deleteAuthor, getAuthor, subscribeToAuthor } from '@/api/authors.js'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const phone = ref('')

const showSubscribe = ref(false)
const subscribeLoading = ref(false)
const subscribeDone = ref(false)
const subscribeError = ref(null)

const loading = ref(true)
const error = ref(null)

const author = reactive({
  id: route.params.id,
  full_name: '',
  books: [],
})

async function onSubscribe() {
  subscribeError.value = null
  subscribeLoading.value = true

  try {
    await subscribeToAuthor(author.id, phone.value)
    subscribeDone.value = true
  } catch (e) {
    if (e.response?.status === 422) {
      subscribeError.value = e.response.data.errors?.[0]?.message || 'Неверный формат телефона'
    } else {
      subscribeError.value = 'Не удалось оформить подписку'
    }
  } finally {
    subscribeLoading.value = false
  }
}

async function onDelete() {
  if (!confirm('Удалить автора?')) return
  await deleteAuthor(author.id)
  router.push('/authors')
}

onMounted(async () => {
  loading.value = true

  try {
    if (route.params.id) {
      const data = await getAuthor(Number(route.params.id))

      author.full_name = data.full_name
      author.books = data.books
    }
  } catch {
    error.value = 'Не удалось загрузить данные'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="author-page">
    <div v-if="loading">Загрузка</div>
    <div v-else-if="error">Ошибка загрузки. Перезагрузите страницу</div>
    <div v-else>
      <div class="author-header">
        <h1>{{ author.full_name }}</h1>
        <div class="actions">
          <div class="action-btns" v-if="auth.isAuthedUser">
            <button @click="router.push(`/authors/${author.id}/edit`)">Редактировать</button>
            <button class="danger" @click="onDelete">Удалить</button>
          </div>

          <button v-if="!subscribeDone" @click="showSubscribe = !showSubscribe">
            Подписаться на новинки
          </button>
          <span v-else class="sub-done">Подписка оформлена</span>
        </div>
      </div>

      <form
        v-if="showSubscribe && !subscribeDone"
        class="subscribe-form"
        @submit.prevent="onSubscribe"
      >
        <input v-model="phone" type="tel" placeholder="+7 900 000-00-00" required />
        <button type="submit" :disabled="subscribeLoading">Подписаться</button>
        <p v-if="subscribeError" class="form-error">{{ subscribeError }}</p>
      </form>

      <h2>Книги</h2>
      <ul v-if="author.books.length" class="book-list">
        <li class="book-item" v-for="book in author.books" :key="book.id">
          <RouterLink :to="`/books/${book.id}`">{{ book.title }}</RouterLink>
          <span class="muted">{{ book.year }}</span>
        </li>
      </ul>
      <p v-else class="muted">У автора пока нет книг</p>
    </div>
  </section>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btns {
  display: flex;
  gap: 12px;
}

.subscribe-form {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}

.sub-done {
  color: var(--text-muted);
}

.book-list {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.book-item {
  display: flex;
  gap: 8px;
}
</style>
