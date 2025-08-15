import axios from 'axios'
//configures axios instance for API requests
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
export const ROOT_BASE_URL = API_BASE_URL.replace(/\/?api\/?$/, '')
//
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.message || err.message
    console.error('API Error:', message)
    throw err
  }
)

export const rootApi = axios.create({
  baseURL: ROOT_BASE_URL,
  withCredentials: false,
})

rootApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api


