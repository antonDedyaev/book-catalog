<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTopAuthors } from '@/api/reports.js'

const router = useRouter()
const route = useRoute()
const currentYear = new Date().getFullYear()
const selectedYear = computed(() => Number(route.query.year) || currentYear)

const years = computed(() => {
  const list = []
  for (let y = currentYear; y >= currentYear - 30; y--) {
    list.push(y)
  }
  return list
})

const authors = ref([])
const loading = ref(false)
const error = ref(null)

function onYearChange(e) {
  router.push({ query: { year: e.target.value } })
}

watch(
  () => route.query.year,
  async () => {
    loading.value = true

    try {
      const data = await getTopAuthors(selectedYear.value)
      authors.value = data.items
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
  <section class="report">
    <h1>ТОП-10 авторов за {{ selectedYear }}</h1>

    <div class="filters">
      <label for="year">Год</label>
      <select id="year" :value="selectedYear" @change="onYearChange">
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>

    <div v-if="loading">Загрузка</div>
    <div v-else-if="error">Не удалось загрузить отчёт</div>
    <p v-else-if="!authors.length" class="muted">Нет данных за этот год</p>
    <table v-else class="report-table">
      <thead>
        <tr>
          <th>Место</th>
          <th>Автор</th>
          <th>Книг</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in authors" :key="row.author_id">
          <td>{{ row.rank }}</td>
          <td>
            <RouterLink :to="`/authors/${row.author_id}`">{{ row.full_name }}</RouterLink>
          </td>
          <td>{{ row.books_count }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
<style scoped>
.report {
  max-width: 640px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.report-table th,
.report-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.report-table th {
  color: var(--text-muted);
  font-weight: 500;
}

.report-table tbody tr:last-child td {
  border-bottom: none;
}
</style>
