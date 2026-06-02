import { Box, Typography, Card, CardContent } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCard = ({ title, value, icon, trend, trendValue, color = '#4F46E5', delay = 0 }) => {
  return (
    <Card sx={{
      background: `linear-gradient(135deg, ${color}15, ${color}08)`,
      border: `1px solid ${color}25`,
      borderRadius: '16px',
      animation: 'fadeInUp 0.5s ease forwards',
      animationDelay: `${delay}s`,
      opacity: 0,
      '&:hover': {
        borderColor: `${color}40`,
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 24px ${color}20`,
      },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500, mb: 0.5, fontSize: '0.8rem' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#F1F5F9', lineHeight: 1.2 }}>
              {value}
            </Typography>
            {trendValue && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {trend === 'up' ? (
                  <TrendingUp sx={{ fontSize: 16, color: '#10B981' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: '#EF4444' }} />
                )}
                <Typography variant="caption" sx={{
                  color: trend === 'up' ? '#10B981' : '#EF4444',
                  fontWeight: 600,
                }}>
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: '12px',
            background: `linear-gradient(135deg, ${color}30, ${color}15)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
