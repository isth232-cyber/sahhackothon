import { useState, useEffect } from 'react';
import { participationService, classroomService } from '../../services/dataService';
import {
  Box, Typography, Card, Grid, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, Avatar, Chip, LinearProgress
} from '@mui/material';
import { People, TrendingUp, EmojiEvents, QuestionAnswer } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const EVENT_COLORS = {
  QUESTION_ASKED: '#4F46E5',
  ANSWER_GIVEN: '#10B981',
  QUIZ_ATTEMPT: '#F59E0B',
  PARTICIPATION: '#0EA5E9',
};

const ParticipationDashboardPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadClassrooms(); }, []);
  useEffect(() => { if (selectedClassroom) loadHeatmap(selectedClassroom); }, [selectedClassroom]);

  const loadClassrooms = async () => {
    try {
      const res = await classroomService.getMyClassrooms();
      const list = res.data?.data || [];
      setClassrooms(list);
      if (list.length > 0) setSelectedClassroom(list[0].id);
    } catch { setClassrooms([]); }
  };

  const loadHeatmap = async (classroomId) => {
    setLoading(true); setError('');
    try {
      const res = await participationService.getHeatmap(classroomId);
      setHeatmap(res.data?.data || []);
    } catch {
      setHeatmap([]);
      setError('Failed to load participation data.');
    }
    setLoading(false);
  };

  // Build chart data from daily scores
  const chartData = heatmap.slice(0, 8).map(s => {
    const dailyEntries = Object.entries(s.dailyScores || {});
    const totalDaily = dailyEntries.reduce((sum, [, v]) => sum + Number(v || 0), 0);
    return { name: s.studentName?.split(' ')[0] || 'Student', score: Number(s.totalScore || 0), daily: totalDaily };
  });

  const maxScore = Math.max(...heatmap.map(s => Number(s.totalScore || 0)), 1);

  const getScoreColor = (score) => {
    const ratio = Number(score) / maxScore;
    if (ratio >= 0.7) return '#10B981';
    if (ratio >= 0.4) return '#F59E0B';
    return '#EF4444';
  };

  const totalScore = heatmap.reduce((sum, s) => sum + Number(s.totalScore || 0), 0);
  const avgScore = heatmap.length ? (totalScore / heatmap.length).toFixed(1) : 0;
  const topStudent = heatmap.reduce((top, s) => Number(s.totalScore) > Number(top?.totalScore || 0) ? s : top, null);

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Participation Dashboard</Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>Student engagement heatmaps and trends</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>{error}</Alert>}

      <FormControl sx={{ mb: 4, minWidth: 280 }}>
        <InputLabel>Select Classroom</InputLabel>
        <Select value={selectedClassroom} label="Select Classroom" onChange={e => setSelectedClassroom(e.target.value)} sx={{ borderRadius: '12px' }}>
          {classrooms.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: '#4F46E5' }} /></Box>
      ) : heatmap.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)' }}>
          <People sx={{ fontSize: 64, color: '#4F46E5', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No Participation Data</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Participation events will appear once students interact in this classroom.</Typography>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: 'Total Students', value: heatmap.length, icon: <People />, color: '#4F46E5' },
              { label: 'Avg Score', value: avgScore, icon: <TrendingUp />, color: '#10B981' },
              { label: 'Top Student', value: topStudent?.studentName?.split(' ')[0] || '-', icon: <EmojiEvents />, color: '#F59E0B' },
              { label: 'Total Events', value: totalScore, icon: <QuestionAnswer />, color: '#0EA5E9' },
            ].map((stat, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Card sx={{ p: 2.5, borderRadius: '14px', background: `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{stat.label}</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* Bar Chart */}
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(148,163,184,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Engagement Scores</Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px', color: '#F1F5F9' }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} name="Score">
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={getScoreColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Heatmap Table */}
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(148,163,184,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Student Leaderboard</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[...heatmap].sort((a, b) => Number(b.totalScore) - Number(a.totalScore)).slice(0, 8).map((s, i) => {
                    const score = Number(s.totalScore || 0);
                    const pct = maxScore ? (score / maxScore) * 100 : 0;
                    return (
                      <Box key={s.studentId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', fontWeight: 700,
                          bgcolor: i === 0 ? 'rgba(245,158,11,0.2)' : i === 1 ? 'rgba(148,163,184,0.15)' : 'rgba(79,70,229,0.1)',
                          color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#6366F1' }}>
                          {i + 1}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#F1F5F9' }}>{s.studentName}</Typography>
                            <Typography variant="caption" sx={{ color: getScoreColor(score), fontWeight: 700 }}>{score}</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct}
                            sx={{ height: 5, borderRadius: 3, bgcolor: 'rgba(148,163,184,0.1)', '& .MuiLinearProgress-bar': { bgcolor: getScoreColor(score), borderRadius: 3 } }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            </Grid>

            {/* Event Type Breakdown */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(148,163,184,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Event Type Breakdown</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {heatmap.slice(0, 6).map(s => (
                    <Card key={s.studentId} sx={{ p: 2, borderRadius: '12px', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.08)', minWidth: 160 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#F1F5F9', display: 'block', mb: 1 }}>{s.studentName?.split(' ')[0]}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Object.entries(s.eventTypeCounts || {}).map(([type, count]) => (
                          <Chip key={type} label={`${type.replace(/_/g, ' ')}: ${count}`} size="small"
                            sx={{ fontSize: '0.6rem', height: 18, bgcolor: `${EVENT_COLORS[type] || '#64748B'}18`, color: EVENT_COLORS[type] || '#94A3B8' }} />
                        ))}
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ParticipationDashboardPage;
