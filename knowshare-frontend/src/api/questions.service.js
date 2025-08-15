import api from './axios'
//manages question-related API endpoints
export const listQuestions = async (params = {}) => {
  const { data } = await api.get('/questions', { params })
  return data
}

export const showQuestion = async (idOrSlug) => {
  const { data } = await api.get(`/questions/${idOrSlug}`)
  return data
}

export const createQuestion = async (payload) => {
  const { data } = await api.post('/questions', payload)
  return data
}

export const voteQuestion = async (questionId, action) => {
  const { data } = await api.post(`/questions/${questionId}/vote`, { action })
  return data
}

export const deleteQuestion = async (questionId) => {
  const { data } = await api.delete(`/questions/${questionId}`)
  return data
}


