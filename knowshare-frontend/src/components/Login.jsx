import { useState } from 'react'
import { login } from '../api/auth.service'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const data = await login(form)
      localStorage.setItem('auth_token', data.token)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <h2 className="text-lg font-semibold">Login</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input name="email" placeholder="Email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} className="w-full border rounded px-3 py-2" />
      <button disabled={submitting} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">
        {submitting ? '...' : 'Sign In'}
      </button>
    </form>
  )
}


