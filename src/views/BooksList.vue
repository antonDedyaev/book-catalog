<script setup>
import { useRoute, useRouter } from 'vue-router'
import { reactive, ref, watch } from 'vue'
import { getBooks } from '@/api/books'
import { useAuthStore } from '@/stores/auth.js'
import AppPagination from '@/components/AppPagination.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const books = ref([])

const pagination = ref(null)
const loading = ref(false)
const error = ref(null)

let timerId

const filters = reactive({
  page: Number(route.query.page) || 1,
  perPage: Number(route.query.perPage) || 10,
  search: route.query.search || '',
  author_id: route.query.author_id,
  year: route.query.year,
})

const searchText = ref(filters.search)

function onCoverError(e) {
  e.target.onerror = null
  e.target.src = '/no-cover.jpg'
}

function onPageChange(page) {
  filters.page = page
}

watch(filters, () => {
  const query = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null && value !== undefined) {
      query[key] = value
    }
  }
  router.push({ query })
})

watch(searchText, (value) => {
  clearTimeout(timerId)
  timerId = setTimeout(() => {
    filters.search = value
    filters.page = 1
  }, 300)
})

watch(
  () => route.query,
  async (value) => {
    loading.value = true

    try {
      const data = await getBooks(value)
      books.value = data.items
      pagination.value = data.pagination
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <section>
    <h1>Каталог книг</h1>
    <div class="filters">
      <input placeholder="Поиск" v-model="searchText" />
    </div>

    <div class="add-btn" v-if="auth.isAuthedUser">
      <button @click="router.push('/authors/create')">Добавить книгу</button>
    </div>

    <div class="results">
      <div v-if="loading">Загрузка</div>
      <div v-else-if="error">Ошибка загрузки. Перезагрузите страницу</div>
      <div v-else-if="!books.length">Ничего не найдено</div>
      <div v-else class="grid">
        <article class="card" v-for="book in books" :key="book.id">
          <img
            class="card-cover"
            :src="book.cover_url || '/no-cover.jpg'"
            :alt="book.title"
            @error="onCoverError"
          />
          <div class="card-body">
            <RouterLink class="card-title" :to="`/books/${book.id}`">{{ book.title }}</RouterLink>
            <span class="card-year">{{ book.year }}</span>
            <div class="card-authors">
              <RouterLink
                v-for="author in book.authors"
                :key="author.id"
                :to="`/authors/${author.id}`"
              >
                {{ author.full_name }}
              </RouterLink>
            </div>
          </div>
        </article>
      </div>
    </div>

    <AppPagination
      v-if="books.length && pagination && pagination.total_pages > 1"
      :page="filters.page"
      :total-pages="pagination.total_pages"
      @change="onPageChange"
    />
  </section>
</template>

<style scoped>
.results {
  margin-top: 80px;
}

.filters {
  display: flex;
  gap: 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--surface);
  box-shadow: 0 1px 3px rgba(0 0 0 / 0.06);
}

.card-cover {
  height: 200px;
  object-fit: cover;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.card-title {
  color: var(--text);
  font-weight: 500;
}

.card-year,
.card-authors {
  color: var(--text-muted);
}

.add-btn {
  margin-top: 20px;
}
</style>
