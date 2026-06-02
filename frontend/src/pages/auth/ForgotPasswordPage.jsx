import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/dataService';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, InputAdornment } from '@mui/material';
import { Email, Psychology } from '@mui/icons-material';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.data?.data || 'Reset link sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F172A, #1E293B)' }}>
      <Card sx={{ width: '100%', maxWidth: 440, borderRadius: '24px', background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(148,163,184,0.15)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '16px', mx: 'auto', mb: 2, background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Psychology sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#F1F5F9' }}>Forgot Password</Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>Enter your email to receive a reset link</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>{message}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 3 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#64748B' }} /></InputAdornment> }}
            />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}
            >Send Reset Link</Button>
          </form>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link to="/login" style={{ color: '#6366F1', fontWeight: 500, fontSize: '0.9rem' }}>← Back to Login</Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
