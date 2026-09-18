import api from '@/api/client.js'

export async function getBooks(params = {}) {
  const response = await api.get('/books', {
    params: {
      page: params.page,
      'per-page': params.perPage,
      search: params.search,
      author_id: params.author_id,
      year: params.year,
    },
  })
  return response.data.data
}

export async function getBook(id) {
  const response = await api.get(`/books/${id}`)
  return response.data.data
}

export async function createBook(formData) {
  const response = await api.post('/books', formData)
  return response.data.data
}

export async function updateBook(id, formData) {
  const response = await api.put(`/books/${id}`, formData)
  return response.data.data
}

export async function patchBook(id, data) {
  const response = await api.patch(`/books/${id}`, data)
  return response.data.data
}

export async function deleteBook(id) {
  await api.delete(`/books/${id}`)
}
