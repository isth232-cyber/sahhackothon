import { Box, Typography, Card, Button } from '@mui/material';
import { Construction } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage = ({ title, description }) => {
  const navigate = useNavigate();
  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Card sx={{ p: 5, textAlign: 'center', borderRadius: '24px', maxWidth: 500 }}>
        <Construction sx={{ fontSize: 64, color: '#4F46E5', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {title || 'Coming Soon'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6 }}>
          {description || 'This feature is being built. The backend APIs are ready and functional.'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: '10px', borderColor: 'rgba(79,70,229,0.3)', color: '#6366F1' }}>
          Go Back
        </Button>
      </Card>
    </Box>
  );
};

export default PlaceholderPage;
