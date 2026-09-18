<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createAuthor, getAuthor, updateAuthor } from '@/api/authors.js'

const router = useRouter()
const route = useRoute()

const form = reactive({
  full_name: '',
})

const isLoading = ref(false)
const fieldErrors = ref({})
const formError = ref(null)

const isEditMode = computed(() => route.params.id)

async function submit() {
  fieldErrors.value = {}
  formError.value = null
  isLoading.value = true

  try {
    if (!isEditMode.value) {
      const response = await createAuthor({ full_name: form.full_name })
      router.push(`/authors/${response.id}`)
    } else {
      const response = await updateAuthor(Number(route.params.id), { full_name: form.full_name })
      router.push(`/authors/${response.id}`)
    }
  } catch (e) {
    if (e.response?.status === 422) {
      const errors = e.response.data.errors ?? []
      fieldErrors.value = Object.fromEntries(errors.map((err) => [err.field, err.message]))

      if (!errors.some((err) => err.field === 'full_name')) {
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
      const data = await getAuthor(Number(route.params.id))
      form.full_name = data.full_name
    }
  } catch {
    formError.value = 'Не удалось загрузить данные'
  }
})
</script>

<template>
  <form @submit.prevent="submit" class="author-form">
    <h2>{{ isEditMode ? 'Редактирование автора' : 'Новый автор' }}</h2>
    <div class="field">
      <label for="author-name">ФИО</label>
      <input id="author-name" v-model="form.full_name" />
      <p v-if="fieldErrors.full_name" class="form-error">{{ fieldErrors.full_name }}</p>
    </div>

    <button type="submit" :disabled="isLoading">{{ isEditMode ? 'Сохранить' : 'Добавить' }}</button>

    <p v-if="formError" class="form-error">{{ formError }}</p>
  </form>
</template>

<style scoped>
.author-form {
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
</style>
