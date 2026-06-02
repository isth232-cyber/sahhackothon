import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Psychology } from '@mui/icons-material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const role = data.role;
      if (role === 'ROLE_ADMIN') navigate('/admin/dashboard');
      else if (role === 'ROLE_TEACHER') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <Box sx={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
        top: -100, right: -100,
      }} />
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
        bottom: -100, left: -100,
      }} />

      <Card sx={{
        width: '100%', maxWidth: 440, borderRadius: '24px',
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        animation: 'scaleIn 0.4s ease forwards',
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '16px', mx: 'auto', mb: 2,
              background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
            }}>
              <Psychology sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SahaPathi AI
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
              Sign in to your account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email Address" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email sx={{ color: '#64748B' }} /></InputAdornment>,
              }}
            />
            <TextField
              fullWidth label="Password" type={showPassword ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)} required
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#64748B' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#64748B' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link to="/forgot-password" style={{ color: '#6366F1', fontSize: '0.8rem', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              sx={{
                py: 1.5, borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                '&:hover': { background: 'linear-gradient(135deg, #3730A3, #4F46E5)' },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ color: '#6366F1', fontWeight: 600 }}>Sign Up</Link>
            </Typography>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
