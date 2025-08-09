import api from './axios'

export const listTags = async (search = '') => {
  const params = {}
  if (search) params.search = search
  const { data } = await api.get('/tags', { params })
  return data
}

export const getPopularTags = async () => {
  const { data } = await api.get('/tags/popular')
  return data
}

export const getTagDetails = async (slug) => {
  const { data } = await api.get(`/tags/${slug}`)
  return data
}


