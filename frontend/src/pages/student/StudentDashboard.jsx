import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { classroomService, quizService, attendanceService } from '../../services/dataService';
import StatsCard from '../../components/StatsCard';
import {
  Box, Grid, Typography, Card, CardContent, Button, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { School, Quiz, MenuBook, Add, Translate, VolumeUp, Psychology } from '@mui/icons-material';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [quizCount, setQuizCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [joinDialog, setJoinDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [classRes, attemptsRes] = await Promise.all([
        classroomService.getMyClassrooms(),
        quizService.getMyAttempts(),
      ]);
      const classList = classRes.data?.data || [];
      setClassrooms(classList);
      setQuizCount(classList.reduce((s, c) => s + (c.quizCount || 0), 0));
      setLessonCount(classList.reduce((s, c) => s + (c.lessonCount || 0), 0));
      setAttemptCount((attemptsRes.data?.data || []).length);
    } catch {
      setClassrooms([]);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    try {
      await classroomService.join(inviteCode);
      setJoinDialog(false);
      setInviteCode('');
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to join');
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Student Dashboard</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Access your classrooms and learning tools</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setJoinDialog(true)}
          sx={{ borderRadius: '12px', py: 1.2 }}>
          Join Classroom
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="My Classrooms" value={classrooms.length} icon={<School sx={{ color: '#4F46E5' }} />} color="#4F46E5" delay={0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Available Quizzes" value={quizCount} icon={<Quiz sx={{ color: '#F59E0B' }} />} color="#F59E0B" delay={0.1} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Lessons Available" value={lessonCount} icon={<MenuBook sx={{ color: '#10B981' }} />} color="#10B981" delay={0.2} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Quiz Attempts" value={attemptCount} icon={<Translate sx={{ color: '#8B5CF6' }} />} color="#8B5CF6" delay={0.3} />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Translate Content', icon: <Translate />, color: '#8B5CF6', path: '/student/translate' },
          { label: 'FLN Learning Hub', icon: <Psychology />, color: '#10B981', path: '/student/fln' },
          { label: 'Take Quiz', icon: <Quiz />, color: '#F59E0B', path: '/student/quizzes' },
          { label: 'Text to Speech', icon: <VolumeUp />, color: '#0EA5E9', action: 'tts' },
        ].map((action, i) => (
          <Grid item xs={12} sm={4} key={action.label}>
            <Card sx={{
              p: 2.5, textAlign: 'center', cursor: 'pointer', borderRadius: '14px',
              background: `${action.color}08`, border: `1px solid ${action.color}20`,
              animation: `fadeInUp 0.4s ease forwards`, animationDelay: `${i * 0.1}s`, opacity: 0,
              '&:hover': { borderColor: `${action.color}40`, transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${action.color}15` },
            }}
            onClick={() => action.path && navigate(action.path)}>
              <Box sx={{ width: 48, height: 48, borderRadius: '12px', mx: 'auto', mb: 1.5, background: `${action.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {action.icon}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#F1F5F9' }}>{action.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Classrooms */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>My Classrooms</Typography>
      <Grid container spacing={2}>
        {classrooms.map((classroom, i) => (
          <Grid item xs={12} sm={6} md={4} key={classroom.id}>
            <Card sx={{
              p: 3, borderRadius: '16px', cursor: 'pointer',
              background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)',
              animation: `fadeInUp 0.4s ease forwards`, animationDelay: `${i * 0.1}s`, opacity: 0,
              '&:hover': { borderColor: 'rgba(79,70,229,0.3)', transform: 'translateY(-3px)' },
            }}
            onClick={() => navigate('/student/classrooms')}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F1F5F9', mb: 0.5 }}>{classroom.name}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>by {classroom.teacherName}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={`${classroom.lessonCount} Lessons`} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.12)', color: '#10B981', fontSize: '0.7rem' }} />
                <Chip label={`${classroom.quizCount} Quizzes`} size="small" sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B', fontSize: '0.7rem' }} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Join Dialog */}
      <Dialog open={joinDialog} onClose={() => setJoinDialog(false)} PaperProps={{ sx: { borderRadius: '16px', background: '#1E293B', border: '1px solid rgba(148,163,184,0.15)', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Join Classroom</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>Enter the invite code shared by your teacher</Typography>
          <TextField fullWidth label="Invite Code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="e.g., ABC123" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setJoinDialog(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleJoin} disabled={!inviteCode}>Join</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
