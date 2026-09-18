import api from '@/api/client.js'

export async function getAuthors(params = {}) {
  const response = await api.get('/authors', {
    params: { page: params.page, 'per-page': params.perPage, search: params.search },
  })

  return response.data.data
}

export async function getAuthor(id) {
  const response = await api.get(`/authors/${id}`)

  return response.data.data
}

export async function createAuthor(data) {
  const response = await api.post('/authors', data)
  return response.data.data
}

export async function updateAuthor(id, data) {
  const response = await api.put(`/authors/${id}`, data)
  return response.data.data
}

export async function deleteAuthor(id) {
  await api.delete(`/authors/${id}`)
}

export async function subscribeToAuthor(id, phone) {
  await api.post(`/authors/${id}/subscribe`, { phone })
}
