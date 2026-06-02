import { useState, useEffect } from 'react';
import { classroomService, aiService } from '../../services/dataService';
import {
  Box, Typography, Card, Grid, Button, Chip, CircularProgress,
  Alert, Avatar, Divider, MenuItem, Select, FormControl, InputLabel,
  List, ListItem, ListItemAvatar, ListItemText, Tooltip, IconButton
} from '@mui/material';
import {
  Psychology, Warning, CheckCircle, AutoAwesome,
  Refresh, DoneAll, TrendingDown, EmojiEvents, School
} from '@mui/icons-material';

const PRIORITY_COLOR = { CRITICAL: '#EF4444', HIGH: '#F59E0B', MEDIUM: '#3B82F6', LOW: '#10B981' };
const TYPE_LABEL = {
  LOW_PARTICIPATION: 'Low Participation',
  ATTENDANCE_CONCERN: 'Attendance',
  IMPROVEMENT: 'Improvement',
  LOW_QUIZ_SCORE: 'Quiz Score',
  AT_RISK: 'At Risk',
};
const TYPE_ICON = {
  LOW_PARTICIPATION: <TrendingDown sx={{ fontSize: 18 }} />,
  ATTENDANCE_CONCERN: <Warning sx={{ fontSize: 18 }} />,
  IMPROVEMENT: <EmojiEvents sx={{ fontSize: 18 }} />,
  LOW_QUIZ_SCORE: <School sx={{ fontSize: 18 }} />,
  AT_RISK: <Warning sx={{ fontSize: 18 }} />,
};

const AIInsightsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadClassrooms(); }, []);
  useEffect(() => { if (selectedClassroom) loadRecommendations(selectedClassroom); }, [selectedClassroom]);

  const loadClassrooms = async () => {
    try {
      const res = await classroomService.getMyClassrooms();
      const list = res.data?.data || [];
      setClassrooms(list);
      if (list.length > 0) setSelectedClassroom(list[0].id);
    } catch {
      setClassrooms([]);
    }
  };

  const loadRecommendations = async (classroomId) => {
    setLoading(true);
    setError('');
    try {
      const res = await aiService.getRecommendations(classroomId);
      setRecommendations(res.data?.data || []);
    } catch {
      setRecommendations([]);
      setError('Failed to load recommendations.');
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!selectedClassroom) return;
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await aiService.generateRecommendations(selectedClassroom);
      setRecommendations(res.data?.data || []);
      setSuccess('AI recommendations generated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Failed to generate recommendations. Please try again.');
    }
    setGenerating(false);
  };

  const handleResolve = async (id) => {
    setResolving(id);
    try {
      await aiService.resolveRecommendation(id);
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch {
      setError('Failed to resolve recommendation.');
    }
    setResolving(null);
  };

  const active = recommendations.filter(r => !r.isResolved);
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  active.forEach(r => { if (counts[r.priority] !== undefined) counts[r.priority]++; });

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            <Psychology sx={{ mr: 1, verticalAlign: 'middle', color: '#8B5CF6' }} />
            AI Insights
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            AI-generated recommendations to support your students
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
          onClick={handleGenerate} disabled={generating || !selectedClassroom}
          sx={{ borderRadius: '12px', py: 1.2, bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }}
        >
          {generating ? 'Generating...' : 'Generate AI Insights'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Classroom Selector */}
      <FormControl sx={{ mb: 4, minWidth: 280 }}>
        <InputLabel>Select Classroom</InputLabel>
        <Select value={selectedClassroom} label="Select Classroom" onChange={e => setSelectedClassroom(e.target.value)}
          sx={{ borderRadius: '12px' }}>
          {classrooms.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Summary Cards */}
      {active.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {Object.entries(counts).map(([priority, count]) => (
            <Grid item xs={6} sm={3} key={priority}>
              <Card sx={{
                p: 2, borderRadius: '14px', textAlign: 'center',
                background: `${PRIORITY_COLOR[priority]}08`,
                border: `1px solid ${PRIORITY_COLOR[priority]}25`,
              }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: PRIORITY_COLOR[priority] }}>{count}</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>{priority}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Recommendations List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress sx={{ color: '#8B5CF6' }} />
        </Box>
      ) : !selectedClassroom ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)' }}>
          <Psychology sx={{ fontSize: 64, color: '#8B5CF6', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No Classrooms Available</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Create a classroom first to view AI insights.
          </Typography>
        </Card>
      ) : active.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)' }}>
          <Psychology sx={{ fontSize: 64, color: '#8B5CF6', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No Active Recommendations</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Click "Generate AI Insights" to analyze student performance and get recommendations.
          </Typography>
          <Button variant="outlined" startIcon={<AutoAwesome />} onClick={handleGenerate} disabled={generating || !selectedClassroom}
            sx={{ borderRadius: '10px', borderColor: 'rgba(139,92,246,0.4)', color: '#8B5CF6' }}>
            Generate Now
          </Button>
        </Card>
      ) : (
        <Card sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(148,163,184,0.1)' }}>
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {active.length} Active Recommendation{active.length !== 1 ? 's' : ''}
            </Typography>
            <Chip icon={<Refresh sx={{ fontSize: 14 }} />} label="Refresh" size="small"
              onClick={() => loadRecommendations(selectedClassroom)}
              sx={{ cursor: 'pointer', bgcolor: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }} />
          </Box>
          <List sx={{ p: 0 }}>
            {active.map((rec, i) => (
              <Box key={rec.id}>
                <ListItem sx={{ px: 3, py: 2, alignItems: 'flex-start' }}
                  secondaryAction={
                    <Tooltip title="Mark as Resolved">
                      <IconButton size="small" onClick={() => handleResolve(rec.id)} disabled={resolving === rec.id}
                        sx={{ color: '#10B981', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)' } }}>
                        {resolving === rec.id ? <CircularProgress size={18} /> : <DoneAll sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{
                      width: 40, height: 40,
                      bgcolor: `${PRIORITY_COLOR[rec.priority]}18`,
                      color: PRIORITY_COLOR[rec.priority],
                    }}>
                      {TYPE_ICON[rec.type] || <Warning sx={{ fontSize: 18 }} />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#F1F5F9' }}>
                          {rec.studentName}
                        </Typography>
                        <Chip label={TYPE_LABEL[rec.type] || rec.type} size="small"
                          sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'rgba(148,163,184,0.1)', color: '#94A3B8' }} />
                        <Chip label={rec.priority} size="small"
                          sx={{ fontSize: '0.65rem', height: 20, bgcolor: `${PRIORITY_COLOR[rec.priority]}15`, color: PRIORITY_COLOR[rec.priority], fontWeight: 700 }} />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                        {rec.message}
                      </Typography>
                    }
                  />
                </ListItem>
                {i < active.length - 1 && <Divider sx={{ borderColor: 'rgba(148,163,184,0.06)', mx: 3 }} />}
              </Box>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default AIInsightsPage;
