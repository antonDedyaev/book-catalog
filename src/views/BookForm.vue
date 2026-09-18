<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { createBook, getBook, patchBook, updateBook } from '@/api/books.js'
import { useRoute, useRouter } from 'vue-router'
import { getAuthors } from '@/api/authors.js'

const router = useRouter()
const route = useRoute()

const form = reactive({
  title: '',
  description: '',
  year: '',
  isbn: '',
  authorIds: [],
})

const authorOptions = ref(null)
const coverFile = ref(null)
const currentCoverUrl = ref(null)
const isLoading = ref(false)
const fieldErrors = ref({})
const formError = ref(null)

const isEditMode = computed(() => route.params.id)

function buildFormData() {
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('year', form.year)
  formData.append('description', form.description)
  formData.append('isbn', form.isbn)
  form.authorIds.forEach((id) => formData.append('author_ids[]', id))

  if (coverFile.value) {
    formData.append('cover', coverFile.value)
  }

  return formData
}

function onFileChange(e) {
  coverFile.value = e.target.files[0] ?? null
}

async function submit() {
  fieldErrors.value = {}
  formError.value = null
  isLoading.value = true

  try {
    if (!isEditMode.value) {
      const response = await createBook(buildFormData())
      router.push(`/books/${response.id}`)
    } else if (coverFile.value) {
      const response = await updateBook(route.params.id, buildFormData())
      router.push(`/books/${response.id}`)
    } else {
      const response = await patchBook(route.params.id, {
        title: form.title,
        year: Number(form.year),
        description: form.description,
        isbn: form.isbn,
        author_ids: form.authorIds,
      })
      router.push(`/books/${response.id}`)
    }
  } catch (e) {
    if (e.response?.status === 422) {
      fieldErrors.value = Object.fromEntries(
        e.response.data.errors.map((err) => [err.field, err.message]),
      )

      const formFields = ['title', 'year', 'description', 'isbn', 'author_ids', 'cover']
      if (!fieldErrors.value.some((err) => formFields.includes(err.field))) {
        formError.value = 'Не удалось сохранить'
      }
    } else {
      formError.value = 'Не удалось сохранить'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    if (route.params.id) {
      const book = await getBook(Number(route.params.id))

      form.title = book.title
      form.description = book.description
      form.year = book.year
      form.isbn = book.isbn
      form.authorIds = book.authors.map((a) => a.id)

      currentCoverUrl.value = book.cover_url
    }

    const authors = await getAuthors({ perPage: 100 })
    authorOptions.value = authors.items
  } catch {
    formError.value = 'Не удалось загрузить данные'
  }
})
</script>

<template>
  <form @submit.prevent="submit" class="book-form">
    <h2>{{ isEditMode ? 'Редактирование книги' : 'Новая книга' }}</h2>
    <div class="field">
      <label for="title">Название</label>
      <input id="title" v-model="form.title" />
      <p v-if="fieldErrors.title" class="form-error">{{ fieldErrors.title }}</p>
    </div>

    <div class="field">
      <label for="year">Год</label>
      <input id="year" v-model="form.year" type="number" />
      <p v-if="fieldErrors.year" class="form-error">{{ fieldErrors.year }}</p>
    </div>

    <div class="field">
      <label for="isbn">ISBN</label>
      <input id="isbn" v-model="form.isbn" />
      <p v-if="fieldErrors.isbn" class="form-error">{{ fieldErrors.isbn }}</p>
    </div>

    <div class="field">
      <label for="description">Описание</label>
      <textarea id="description" v-model="form.description" />
      <p v-if="fieldErrors.description" class="form-error">{{ fieldErrors.description }}</p>
    </div>

    <div class="field">
      <label for="authors">Авторы</label>
      <select multiple v-model="form.authorIds" id="authors" size="6">
        <option v-for="a in authorOptions" :key="a.id" :value="a.id">{{ a.full_name }}</option>
      </select>
      <p v-if="fieldErrors.author_ids" class="form-error">{{ fieldErrors.author_ids }}</p>
    </div>

    <div class="field">
      <label for="cover">Обложка</label>
      <input type="file" accept="image/*" id="cover" @change="onFileChange" />
      <img v-if="currentCoverUrl && !coverFile" alt="Обложка" :src="currentCoverUrl" class="cover-preview" />
      <p v-if="fieldErrors.cover" class="form-error">{{ fieldErrors.cover }}</p>
    </div>

    <button type="submit" :disabled="isLoading">{{ isEditMode ? 'Сохранить' : 'Добавить' }}</button>

    <p v-if="formError" class="form-error">{{ formError }}</p>
  </form>
</template>

<style scoped>
.book-form {
  width: 560px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.cover-preview {
  max-height: 120px;
}
</style>
