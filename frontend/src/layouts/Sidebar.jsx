import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, IconButton, Tooltip, Chip
} from '@mui/material';
import {
  Dashboard, School, MenuBook, Quiz, People, BarChart,
  Notifications, Settings, Logout, Psychology, CalendarMonth,
  Translate, AdminPanelSettings, ChevronLeft, ChevronRight,
  Home, Class, Assessment
} from '@mui/icons-material';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED = 72;

const Sidebar = ({ open, onToggle }) => {
  const { user, logout, isTeacher, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const teacherMenu = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/teacher/dashboard' },
    { text: 'My Classrooms', icon: <School />, path: '/teacher/classrooms' },
    { text: 'Lessons', icon: <MenuBook />, path: '/teacher/lessons' },
    { text: 'Quizzes', icon: <Quiz />, path: '/teacher/quizzes' },
    { text: 'Attendance', icon: <CalendarMonth />, path: '/teacher/attendance' },
    { text: 'Participation', icon: <BarChart />, path: '/teacher/participation' },
    { text: 'AI Insights', icon: <Psychology />, path: '/teacher/insights' },
  ];

  const studentMenu = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/student/dashboard' },
    { text: 'My Classrooms', icon: <School />, path: '/student/classrooms' },
    { text: 'Quizzes', icon: <Quiz />, path: '/student/quizzes' },
    { text: 'Translate', icon: <Translate />, path: '/student/translate' },
  ];

  const adminMenu = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Teachers', icon: <People />, path: '/admin/teachers' },
    { text: 'Students', icon: <People />, path: '/admin/students' },
    { text: 'Classrooms', icon: <School />, path: '/admin/classrooms' },
    { text: 'Analytics', icon: <Assessment />, path: '/admin/analytics' },
  ];

  const menuItems = isAdmin() ? adminMenu : isTeacher() ? teacherMenu : studentMenu;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user?.role?.replace('ROLE_', '') || '';
  const roleColor = isAdmin() ? '#F59E0B' : isTeacher() ? '#10B981' : '#0EA5E9';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Logo Area */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Psychology sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F1F5F9', lineHeight: 1.2, fontSize: '0.95rem' }}>
                SahaPathi AI
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                Inclusive Learning
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton onClick={onToggle} sx={{ color: '#94A3B8' }}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

      {/* User Info */}
      {open && (
        <Box sx={{ p: 2 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 1.5, borderRadius: '12px',
            background: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.15)',
          }}>
            <Avatar sx={{
              width: 40, height: 40,
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
              fontSize: '1rem', fontWeight: 700,
            }}>
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName || 'User'}
              </Typography>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  height: 20, fontSize: '0.65rem', fontWeight: 600,
                  bgcolor: `${roleColor}22`, color: roleColor,
                  border: `1px solid ${roleColor}44`,
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ px: 1, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.text} title={open ? '' : item.text} placement="right">
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '10px',
                    minHeight: 44,
                    px: open ? 2 : 2.5,
                    justifyContent: open ? 'initial' : 'center',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(14,165,233,0.1))'
                      : 'transparent',
                    borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent',
                    '&:hover': {
                      background: 'rgba(79, 70, 229, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 0, mr: open ? 2 : 0,
                    justifyContent: 'center',
                    color: isActive ? '#6366F1' : '#64748B',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#F1F5F9' : '#94A3B8',
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

      {/* Logout */}
      <List sx={{ px: 1, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '10px', minHeight: 44,
              px: open ? 2 : 2.5,
              justifyContent: open ? 'initial' : 'center',
              '&:hover': { background: 'rgba(239, 68, 68, 0.1)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center', color: '#EF4444' }}>
              <Logout />
            </ListItemIcon>
            {open && <ListItemText primary="Logout" sx={{ '& .MuiTypography-root': { fontSize: '0.875rem', color: '#EF4444', fontWeight: 500 } }} />}
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
