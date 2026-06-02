import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { classroomService, aiService, attendanceService, participationService } from '../../services/dataService';
import StatsCard from '../../components/StatsCard';
import {
  Box, Grid, Typography, Card, CardContent, Button, Chip, Skeleton,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider
} from '@mui/material';
import {
  School, People, MenuBook, Quiz, TrendingUp, Psychology,
  CalendarMonth, Add, ArrowForward, Warning, CheckCircle
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const classRes = await classroomService.getMyClassrooms();
      const classList = classRes.data?.data || [];
      setClassrooms(classList);

      if (classList.length > 0) {
        const cid = classList[0].id;
        // Load recommendations
        try {
          const recRes = await aiService.getRecommendations(cid);
          setRecommendations(recRes.data?.data || []);
        } catch { setRecommendations([]); }

        // Load last 5 days attendance for chart
        try {
          const days = [];
          for (let i = 4; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en', { weekday: 'short' });
            const res = await attendanceService.getByDate(cid, dateStr);
            const records = res.data?.data || [];
            const total = records.length;
            const present = records.filter(r => r.status === 'PRESENT').length;
            days.push({ day: label, attendance: total ? Math.round((present / total) * 100) : 0 });
          }
          setChartData(days);
        } catch { setChartData([]); }
      }
    } catch {
      setClassrooms([]);
    }
    setLoading(false);
  };

  const totalStudents = classrooms.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalLessons = classrooms.reduce((sum, c) => sum + (c.lessonCount || 0), 0);
  const totalQuizzes = classrooms.reduce((sum, c) => sum + (c.quizCount || 0), 0);

  const priorityColors = { CRITICAL: '#EF4444', HIGH: '#F59E0B', MEDIUM: '#3B82F6', LOW: '#10B981' };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Teacher Dashboard</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Overview of your classrooms and student performance</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/teacher/classrooms')}
          sx={{ borderRadius: '12px', py: 1.2 }}>
          New Classroom
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Classrooms" value={classrooms.length} icon={<School sx={{ color: '#4F46E5' }} />} color="#4F46E5" trend="up" trendValue="+2 this month" delay={0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Students" value={totalStudents} icon={<People sx={{ color: '#0EA5E9' }} />} color="#0EA5E9" trend="up" trendValue="+12 new" delay={0.1} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Lessons Created" value={totalLessons} icon={<MenuBook sx={{ color: '#10B981' }} />} color="#10B981" trend="up" trendValue="+5 this week" delay={0.2} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Active Quizzes" value={totalQuizzes} icon={<Quiz sx={{ color: '#F59E0B' }} />} color="#F59E0B" delay={0.3} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Participation Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: '16px', p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Weekly Engagement Trends</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorParticipation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px', color: '#F1F5F9' }} />
                <Area type="monotone" dataKey="participation" stroke="#4F46E5" strokeWidth={2} fill="url(#colorParticipation)" name="Participation %" />
                <Area type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} fill="url(#colorAttendance)" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '16px', p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                <Psychology sx={{ mr: 1, verticalAlign: 'middle', color: '#8B5CF6' }} />
                AI Insights
              </Typography>
              <Chip label={`${recommendations.length} New`} size="small" sx={{ bgcolor: 'rgba(139,92,246,0.15)', color: '#8B5CF6', fontWeight: 600 }} />
            </Box>
            <List sx={{ p: 0 }}>
              {recommendations.map((rec, i) => (
                <Box key={rec.id}>
                  <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar sx={{
                        width: 32, height: 32, fontSize: '0.8rem',
                        bgcolor: `${priorityColors[rec.priority]}20`,
                        color: priorityColors[rec.priority],
                      }}>
                        {rec.priority === 'LOW' ? <CheckCircle sx={{ fontSize: 18 }} /> : <Warning sx={{ fontSize: 18 }} />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.8rem' }}>{rec.studentName}</Typography>}
                      secondary={<Typography variant="caption" sx={{ color: '#94A3B8', lineHeight: 1.4 }}>{rec.message}</Typography>}
                    />
                  </ListItem>
                  {i < recommendations.length - 1 && <Divider sx={{ borderColor: 'rgba(148,163,184,0.08)' }} />}
                </Box>
              ))}
            </List>
            <Button fullWidth variant="outlined" size="small" onClick={() => navigate('/teacher/insights')}
              sx={{ mt: 2, borderRadius: '10px', borderColor: 'rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
              View All Insights
            </Button>
          </Card>
        </Grid>

        {/* Classrooms List */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: '16px', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>My Classrooms</Typography>
              <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/teacher/classrooms')}
                sx={{ color: '#6366F1' }}>View All</Button>
            </Box>
            <Grid container spacing={2}>
              {classrooms.map((classroom, i) => (
                <Grid item xs={12} sm={6} md={4} key={classroom.id}>
                  <Card sx={{
                    p: 2.5, borderRadius: '14px', cursor: 'pointer',
                    background: 'rgba(79, 70, 229, 0.05)',
                    border: '1px solid rgba(79, 70, 229, 0.12)',
                    animation: `fadeInUp 0.4s ease forwards`,
                    animationDelay: `${i * 0.1}s`, opacity: 0,
                    '&:hover': { borderColor: 'rgba(79,70,229,0.3)', transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(79,70,229,0.15)' },
                  }}
                  onClick={() => navigate(`/teacher/classrooms`)}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F1F5F9', mb: 1 }}>
                      {classroom.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      <Chip label={classroom.subject} size="small" sx={{ bgcolor: 'rgba(79,70,229,0.12)', color: '#6366F1', fontSize: '0.7rem' }} />
                      <Chip label={`Grade ${classroom.grade}`} size="small" sx={{ bgcolor: 'rgba(14,165,233,0.12)', color: '#0EA5E9', fontSize: '0.7rem' }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        <People sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        {classroom.studentCount} students
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        <MenuBook sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        {classroom.lessonCount} lessons
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 1 }}>
                      Code: <span style={{ color: '#6366F1', fontWeight: 600 }}>{classroom.inviteCode}</span>
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;
