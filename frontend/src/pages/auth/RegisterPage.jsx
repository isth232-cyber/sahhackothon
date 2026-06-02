import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Email, Lock, Person, Phone, Visibility, VisibilityOff, Psychology } from '@mui/icons-material';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phone: '', role: 'STUDENT', languagePref: 'English',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(formData);
      const role = data.role;
      if (role === 'ROLE_ADMIN') navigate('/admin/dashboard');
      else if (role === 'ROLE_TEACHER') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      position: 'relative', overflow: 'hidden', py: 4,
    }}>
      <Box sx={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', top: -100, left: -100 }} />

      <Card sx={{
        width: '100%', maxWidth: 480, borderRadius: '24px',
        background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(148, 163, 184, 0.15)', animation: 'scaleIn 0.4s ease forwards',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '16px', mx: 'auto', mb: 2,
              background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
            }}>
              <Psychology sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>Join SahaPathi AI classroom</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" name="fullName" value={formData.fullName}
              onChange={handleChange} required sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#64748B' }} /></InputAdornment> }}
            />
            <TextField fullWidth label="Email" name="email" type="email" value={formData.email}
              onChange={handleChange} required sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#64748B' }} /></InputAdornment> }}
            />
            <TextField fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'}
              value={formData.password} onChange={handleChange} required sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#64748B' }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#64748B' }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
              }}
            />
            <TextField fullWidth label="Phone (Optional)" name="phone" value={formData.phone}
              onChange={handleChange} sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#64748B' }} /></InputAdornment> }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select name="role" value={formData.role} label="Role" onChange={handleChange}>
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select name="languagePref" value={formData.languagePref} label="Language" onChange={handleChange}>
                  {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map(l => (
                    <MenuItem key={l} value={l}>{l}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, borderRadius: '12px', fontSize: '1rem', fontWeight: 700, background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Already have an account? <Link to="/login" style={{ color: '#6366F1', fontWeight: 600 }}>Sign In</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
