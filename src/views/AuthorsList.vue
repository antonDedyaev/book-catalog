<script setup>
import { useRoute, useRouter } from 'vue-router'
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { getAuthors } from '@/api/authors.js'
import AppPagination from '@/components/AppPagination.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const authors = ref([])

const filters = reactive({
  search: route.query.search || '',
  page: Number(route.query.page) || 1,
})

const pagination = ref(null)
const loading = ref(false)
const error = ref(null)

let timerId

const searchText = ref(filters.search)

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

  return () => clearTimeout(timerId)
})

watch(
  () => route.query,
  async (value) => {
    loading.value = true

    try {
      const data = await getAuthors(value)
      authors.value = data.items
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
    <h1>Авторы</h1>
    <div class="filters">
      <input placeholder="Поиск" v-model="searchText" />
    </div>

    <div class="add-btn" v-if="auth.isAuthedUser">
      <button @click="router.push('/authors/create')">Добавить автора</button>
    </div>

    <div class="results">
      <div v-if="loading">Загрузка</div>
      <div v-else-if="error">Ошибка загрузки. Перезагрузите страницу</div>
      <div v-else-if="!authors.length">Ничего не найдено</div>
      <ul v-else class="list">
        <li class="author-item" v-for="author in authors" :key="author.id">
          <RouterLink class="author-name" :to="`/authors/${author.id}`">{{
            author.full_name
          }}</RouterLink>
        </li>
      </ul>
    </div>

    <AppPagination
      v-if="authors.length && pagination && pagination.total_pages > 1"
      :page="filters.page"
      :total-pages="pagination.total_pages"
      @change="onPageChange"
    />
  </section>
</template>

<style scoped>
.results {
  margin-top: 50px;
}

.list {
  width: fit-content;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: circle;
}

.author-item {
  height: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.author-name {
  text-align: start;
  color: var(--text);
  font-weight: 500;
}

.add-btn {
  margin-top: 20px;
}
</style>
