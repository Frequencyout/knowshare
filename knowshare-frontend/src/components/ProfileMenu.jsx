import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/auth.service'
import { getMe } from '../api/account.service'

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const [me, setMe] = useState(null)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      getMe().then(setMe).catch(() => {})
    }
  }, []) // Only run once on mount

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const onLogout = async () => {
    try { 
      await logout() 
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('auth_token')
    navigate('/login')
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="w-9 h-9 rounded-full border overflow-hidden">
        <img src={me?.avatar_url || 'https://via.placeholder.com/64'} alt="avatar" className="w-full h-full object-cover" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow border rounded p-1 z-20">
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => navigate('/profile')}>Settings</button>
          <div className="border-t my-1" />
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600" onClick={onLogout}>Logout</button>
        </div>
      )}
    </div>
  )
}


