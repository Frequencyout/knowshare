import api from './axios'
//handles user authentication and registration

export const register = async ({ name, email, password, password_confirmation }) => {
  const { data } = await api.post('/register', { name, email, password, password_confirmation })
  return data
}

export const login = async ({ email, password }) => {
  const { data } = await api.post('/login', { email, password })
  return data
}

export const logout = async () => {
  const { data } = await api.post('/logout')
  return data
}

