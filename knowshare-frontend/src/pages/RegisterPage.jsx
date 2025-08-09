import Register from '../components/Register'
import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">Create account</h1>
      <Register />
      <p className="text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 underline">Sign in</Link>
      </p>
    </div>
  )
}


