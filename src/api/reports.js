import api from '@/api/client.js'

export async function getTopAuthors(year) {
  const response = await api.get('/reports/top-authors', { params: { year } })
  return response.data.data
}
