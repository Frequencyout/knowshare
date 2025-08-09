import { useEffect, useState } from 'react'
import { getMe, updateMe } from '../api/account.service'
import api from '../api/axios'

export default function ProfilePage() {
  const [me, setMe] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMe().then(setMe)
  }, [])

  const onChange = (e) => setMe((m) => ({ ...m, [e.target.name]: e.target.value }))

  const onSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await updateMe({ name: me.name, avatar_url: me.avatar_url, bio: me.bio })
      setMe(updated)
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    setError('')
    try {
      const form = new FormData()
      form.append('avatar', file)
      const { data } = await api.post('/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMe((m) => ({ ...m, avatar_url: data.avatar_url }))
    } catch (e) {
      setError(e?.response?.data?.message || 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  if (!me) return <div className="p-4">Loading...</div>

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <form onSubmit={onSave} className="space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input name="name" className="w-full border rounded px-3 py-2" value={me.name || ''} onChange={onChange} />
        </div>
        <div className="flex items-center gap-3">
          <img src={me.avatar_url || 'https://via.placeholder.com/64'} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
          <div>
            <label className="block text-sm">Upload Avatar</label>
            <input type="file" accept="image/*" onChange={onUpload} />
          </div>
        </div>
        <div>
          <label className="block text-sm">Bio</label>
          <textarea name="bio" rows={5} className="w-full border rounded px-3 py-2" value={me.bio || ''} onChange={onChange} />
        </div>
        <button disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  )
}


