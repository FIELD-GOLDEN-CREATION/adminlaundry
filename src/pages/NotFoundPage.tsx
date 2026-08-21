import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', textAlign: 'center',
    }}>
      <p style={{ fontSize: 72, fontWeight: 800, color: 'rgba(26,92,88,0.15)', margin: 0 }}>404</p>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2C3E50', marginTop: 12 }}>Page not found</h1>
      <p style={{ fontSize: 14, color: '#64748B', marginTop: 8, maxWidth: 360 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 24, padding: '10px 20px', fontSize: 13, fontWeight: 700,
          color: '#FFFFFF', background: '#1A5C58', border: 'none', borderRadius: 10,
          cursor: 'pointer',
        }}
      >
        Back to Dashboard
      </button>
    </div>
  )
}
