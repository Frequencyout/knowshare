import api from './axios'

export const getMe = async () => {
  const { data } = await api.get('/me')
  return data
}

export const updateMe = async (payload) => {
  const { data } = await api.patch('/me', payload)
  return data
}

export const myQuestions = async (params = {}) => {
  const { data } = await api.get('/me/questions', { params })
  return data
}

export const myAnswers = async (params = {}) => {
  const { data } = await api.get('/me/answers', { params })
  return data
}


