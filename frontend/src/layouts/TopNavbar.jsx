import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { notificationService } from '../services/dataService';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Box, Menu, MenuItem,
  Divider, Switch, Slider, Popover, Avatar, Chip, Tooltip
} from '@mui/material';
import {
  Notifications, Accessibility, DarkMode, LightMode,
  VolumeUp, TextIncrease, FormatSize
} from '@mui/icons-material';

const TopNavbar = () => {
  const { user } = useAuth();
  const { fontSize, setFontSize, dyslexiaMode, setDyslexiaMode, highContrast, setHighContrast } = useAccessibility();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [accessAnchor, setAccessAnchor] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getUnread();
      setNotifications(res.data?.data || []);
      setUnreadCount(res.data?.data?.length || 0);
    } catch (e) {
      // Silently fail if backend not connected
    }
  };

  const fontSizeMap = { small: 0, medium: 1, large: 2 };
  const fontSizeLabels = ['Small', 'Medium', 'Large'];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Welcome back, <span style={{ color: '#6366F1' }}>{user?.fullName?.split(' ')[0] || 'User'}</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Accessibility Toggle */}
          <Tooltip title="Accessibility Settings">
            <IconButton onClick={(e) => setAccessAnchor(e.currentTarget)} sx={{ color: '#94A3B8' }}>
              <Accessibility />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ color: '#94A3B8' }}>
              <Badge badgeContent={unreadCount} color="error" max={9}>
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Chip */}
          <Chip
            avatar={<Avatar sx={{ bgcolor: '#4F46E5' }}>{user?.fullName?.charAt(0)}</Avatar>}
            label={user?.role?.replace('ROLE_', '')}
            size="small"
            sx={{
              ml: 1, bgcolor: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              color: '#94A3B8', fontWeight: 500,
            }}
          />
        </Box>
      </Toolbar>

      {/* Accessibility Popover */}
      <Popover
        open={Boolean(accessAnchor)}
        anchorEl={accessAnchor}
        onClose={() => setAccessAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 3, width: 300, borderRadius: '16px', background: '#1E293B', border: '1px solid rgba(148,163,184,0.15)' } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#F1F5F9' }}>
          ♿ Accessibility Settings
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>Font Size</Typography>
          <Slider
            value={fontSizeMap[fontSize]}
            min={0} max={2} step={1}
            marks={fontSizeLabels.map((l, i) => ({ value: i, label: l }))}
            onChange={(e, v) => setFontSize(['small', 'medium', 'large'][v])}
            sx={{ color: '#4F46E5', mt: 1 }}
          />
        </Box>

        <Divider sx={{ my: 1.5, borderColor: 'rgba(148,163,184,0.1)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>Dyslexia-Friendly</Typography>
          <Switch checked={dyslexiaMode} onChange={(e) => setDyslexiaMode(e.target.checked)} color="primary" size="small" />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>High Contrast</Typography>
          <Switch checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} color="primary" size="small" />
        </Box>
      </Popover>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{ sx: { width: 340, maxHeight: 400, borderRadius: '16px', background: '#1E293B', border: '1px solid rgba(148,163,184,0.15)' } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F1F5F9' }}>Notifications</Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(148,163,184,0.1)' }} />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" sx={{ color: '#64748B' }}>No new notifications</Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <MenuItem key={n.id} sx={{ py: 1.5, borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.8rem' }}>{n.title}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>{n.message?.substring(0, 60)}...</Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </AppBar>
  );
};

export default TopNavbar;
