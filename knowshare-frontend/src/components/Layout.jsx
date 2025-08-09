import { Link, Outlet, useLocation } from 'react-router-dom'
import ProfileMenu from './ProfileMenu'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/tags', label: 'Tags' },
  { to: '/ask', label: 'Ask' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-4">
        <aside className="col-span-3 md:col-span-2 p-4">
          <div className="text-xl font-bold mb-4">KnowShare</div>
          <nav className="space-y-1">
            {nav.map(n => (
              <Link key={n.to} to={n.to} className={`block px-3 py-2 rounded-md ${pathname===n.to? 'bg-blue-100 text-blue-900':'hover:bg-gray-100'}`}>{n.label}</Link>
            ))}
          </nav>
        </aside>
        <main className="col-span-9 md:col-span-7 border-x bg-white min-h-screen">
          <Outlet />
        </main>
        <aside className="col-span-3 md:col-span-3 p-4">
          <div className="flex justify-end"><ProfileMenu /></div>
          <div className="mt-4 text-sm text-gray-500">Search, trends, and suggested tags can go here.</div>
        </aside>
      </div>
    </div>
  )
}


