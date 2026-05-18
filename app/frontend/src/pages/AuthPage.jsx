import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import TextInput from '../components/ui/TextInput'
import { useAuth } from '../contexts/AuthContext'

function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, signup } = useAuth()

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (mode === 'signup' && !form.name.trim()) return setError('Please enter your name.')
    if (!form.email.trim() || !form.password.trim()) return setError('Email and password are required.')
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await login(form.email.trim(), form.password)
      } else {
        await signup(form.name.trim(), form.email.trim(), form.password)
      }
      navigate(mode === 'signup' ? '/onboarding' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout className="auth-shell">
      <header className="center-header">
        <span className="chip">Welcome back</span>
        <h1>{mode === 'login' ? 'Log in to continue' : 'Create your account'}</h1>
        <p>Keep your AI tutor, flashcards, quizzes, and progress in one place.</p>
      </header>

      <Card className="auth-card">
        <div className="tab-switch">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">Login</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')} type="button">Sign up</button>
        </div>

        <form className="form-stack" onSubmit={submit}>
          {mode === 'signup' ? <TextInput label="Name" value={form.name} onChange={update('name')} placeholder="Your name" /> : null}
          <TextInput label="Email" value={form.email} onChange={update('email')} placeholder="you@example.com" type="email" />
          <TextInput label="Password" value={form.password} onChange={update('password')} placeholder="At least 6 characters" type="password" />
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? 'Please wait...' : (mode === 'login' ? 'Log in' : 'Create account')}</Button>
          <Button variant="ghost" to="/onboarding">Continue as Guest</Button>
        </form>
      </Card>
    </AuthLayout>
  )
}

export default AuthPage
