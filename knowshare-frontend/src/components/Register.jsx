import { useState } from 'react'
import { register } from '../api/auth.service'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <h2 className="text-lg font-semibold">Register</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input name="name" placeholder="Name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" />
      <input name="email" placeholder="Email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} className="w-full border rounded px-3 py-2" />
      <input name="password_confirmation" type="password" placeholder="Confirm Password" value={form.password_confirmation} onChange={onChange} className="w-full border rounded px-3 py-2" />
      <button disabled={submitting} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60">{submitting ? '...' : 'Create Account'}</button>
    </form>
  )
}

