import Login from '../components/Login'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">KnowShare</h1>
      <Login />
      <p className="text-sm text-gray-600">
        New here? <Link to="/register" className="text-blue-600 underline">Create an account</Link>
      </p>
    </div>
  )
}


