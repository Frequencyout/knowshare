import api from './axios'
//manages badge-related API endpoints
export const getAllBadges = async () => {
  const { data } = await api.get('/badges')
  return data
}

export const getBadgeStats = async () => {
  const { data } = await api.get('/badges/stats')
  return data
}

export const getBadgesByType = async (type) => {
  const { data } = await api.get(`/badges/type/${type}`)
  return data
}

export const getBadgeDetails = async (badgeId) => {
  const { data } = await api.get(`/badges/${badgeId}`)
  return data
}

export const getUserBadges = async () => {
  const { data } = await api.get('/me/badges')
  return data
}
