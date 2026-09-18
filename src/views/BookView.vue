<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { deleteBook, getBook } from '@/api/books.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const book = ref(null)
const loading = ref(true)
const error = ref(null)

async function onDelete() {
  if (!confirm('Удалить книгу?')) return
  await deleteBook(book.value.id)
  router.push('/')
}

function onCoverError(e) {
  e.target.onerror = null
  e.target.src = '/no-cover.jpg'
}

onMounted(async () => {
  loading.value = true

  try {
    if (route.params.id) {
      book.value = await getBook(Number(route.params.id))
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
    <div v-else class="book-page">
      <img
        class="book-cover"
        :src="book.cover_url || '/no-cover.jpg'"
        :alt="book.title"
        @error="onCoverError"
      />
      <div class="book-info">
        <h1>{{ book.title }}</h1>
        <p class="muted">{{ book.year }} · ISBN: {{ book.isbn }}</p>
        <p class="authors">
          <RouterLink v-for="a in book.authors" :key="a.id" :to="`/authors/${a.id}`">
            {{ a.full_name }}
          </RouterLink>
        </p>
        <p class="description">{{ book.description }}</p>
        <div class="action-btns" v-if="auth.isAuthedUser">
          <RouterLink :to="`/books/${book.id}/edit`">Редактировать</RouterLink>
          <button class="danger" @click="onDelete">Удалить</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.book-page {
  display: flex;
  gap: 24px;
}
.action-btns {
  display: flex;
  gap: 16px;
  align-items: center;
}

.book-cover {
  width: 240px;
  align-self: flex-start;
  border-radius: 8px;
}

.authors {
  display: flex;
  gap: 16px;
}
</style>
