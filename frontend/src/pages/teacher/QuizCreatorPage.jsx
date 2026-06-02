import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Divider, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Switch, FormControlLabel
} from '@mui/material';
import {
  Add, Delete, Edit, ExpandMore, Quiz, Publish, Visibility,
  CheckCircle, Cancel, School
} from '@mui/icons-material';
import { quizService, classroomService } from '../../services/dataService';
import toast from 'react-hot-toast';

const emptyQuestion = () => ({
  questionText: '', optionA: '', optionB: '', optionC: '', optionD: '',
  correctOption: 'A', points: 10, explanation: ''
});

const emptyQuiz = () => ({
  title: '', description: '', classroomId: '', durationMinutes: 30, questions: [emptyQuestion()]
});

const QuizCreatorPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyQuiz());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    classroomService.getMyClassrooms().then(r => {
      const list = r.data?.data || [];
      setClassrooms(list);
      if (list.length > 0) setSelectedClassroom(list[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClassroom) return;
    setLoading(true);
    quizService.getByClassroom(selectedClassroom).then(r => {
      setQuizzes(r.data?.data || []);
    }).catch(() => setQuizzes([])).finally(() => setLoading(false));
  }, [selectedClassroom]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyQuiz(), classroomId: selectedClassroom });
    setDialogOpen(true);
  };

  const openEdit = (quiz) => {
    setEditing(quiz.id);
    setForm({
      title: quiz.title, description: quiz.description || '',
      classroomId: quiz.classroomId || selectedClassroom,
      durationMinutes: quiz.durationMinutes || 30,
      questions: quiz.questions?.length > 0 ? quiz.questions.map(q => ({
        questionText: q.questionText, optionA: q.optionA, optionB: q.optionB,
        optionC: q.optionC || '', optionD: q.optionD || '',
        correctOption: q.correctOption, points: q.points || 10, explanation: q.explanation || ''
      })) : [emptyQuestion()]
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error('Quiz title is required');
    if (!form.classroomId) return toast.error('Select a classroom');
    if (form.questions.some(q => !q.questionText.trim() || !q.optionA.trim() || !q.optionB.trim()))
      return toast.error('Each question needs text and at least 2 options');

    setSaving(true);
    try {
      await quizService.create(form);
      toast.success('Quiz created!');
      setDialogOpen(false);
      const r = await quizService.getByClassroom(selectedClassroom);
      setQuizzes(r.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save quiz');
    }
    setSaving(false);
  };

  const publish = async (id) => {
    try {
      await quizService.publish(id);
      toast.success('Quiz published!');
      const r = await quizService.getByClassroom(selectedClassroom);
      setQuizzes(r.data?.data || []);
    } catch (e) {
      toast.error('Failed to publish');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await quizService.delete(id);
      toast.success('Deleted');
      setQuizzes(q => q.filter(x => x.id !== id));
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, emptyQuestion()] }));
  const removeQuestion = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  const updateQuestion = (i, field, val) => setForm(f => {
    const qs = [...f.questions];
    qs[i] = { ...qs[i], [field]: val };
    return { ...f, questions: qs };
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            <Quiz sx={{ mr: 1, verticalAlign: 'middle', color: '#8B5CF6' }} />
            Quiz Creator
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Create and manage multiple-choice quizzes for your classrooms</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>
          New Quiz
        </Button>
      </Box>

      {/* Classroom Selector */}
      <FormControl size="small" sx={{ mb: 3, minWidth: 240 }}>
        <InputLabel>Classroom</InputLabel>
        <Select value={selectedClassroom} label="Classroom"
          onChange={e => setSelectedClassroom(e.target.value)} sx={{ borderRadius: '10px' }}>
          {classrooms.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </Select>
      </FormControl>

      {/* Quiz List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : quizzes.length === 0 ? (
        <Card sx={{ borderRadius: '16px', p: 6, textAlign: 'center' }}>
          <Quiz sx={{ fontSize: 48, color: '#334155', mb: 2 }} />
          <Typography sx={{ color: '#64748B' }}>No quizzes yet. Create your first quiz!</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {quizzes.map(quiz => (
            <Grid item xs={12} md={6} key={quiz.id}>
              <Card sx={{ borderRadius: '16px', p: 3, border: '1px solid rgba(148,163,184,0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{quiz.title}</Typography>
                    {quiz.description && (
                      <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>{quiz.description}</Typography>
                    )}
                  </Box>
                  <Chip
                    label={quiz.isPublished ? 'Published' : 'Draft'}
                    size="small"
                    icon={quiz.isPublished ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                    sx={{
                      bgcolor: quiz.isPublished ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)',
                      color: quiz.isPublished ? '#10B981' : '#94A3B8'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    📝 {quiz.questionCount || quiz.questions?.length || 0} questions
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    ⏱ {quiz.durationMinutes || 30} min
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    🏆 {quiz.totalMarks || 0} marks
                  </Typography>
                  {quiz.attemptCount > 0 && (
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      👥 {quiz.attemptCount} attempts
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.1)' }} />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {!quiz.isPublished && (
                    <Button size="small" variant="outlined" startIcon={<Publish />}
                      onClick={() => publish(quiz.id)}
                      sx={{ borderRadius: '8px', borderColor: 'rgba(16,185,129,0.3)', color: '#10B981', fontSize: '0.75rem' }}>
                      Publish
                    </Button>
                  )}
                  <IconButton size="small" onClick={() => openEdit(quiz)} sx={{ color: '#6366F1' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => remove(quiz.id)} sx={{ color: '#EF4444' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', background: '#0F172A', border: '1px solid rgba(148,163,184,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? 'Edit Quiz' : 'Create New Quiz'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(148,163,184,0.1)' }}>
          <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Quiz Title" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Duration (minutes)" type="number" value={form.durationMinutes}
                onChange={e => setForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) || 30 }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description (optional)" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Classroom</InputLabel>
                <Select value={form.classroomId} label="Classroom"
                  onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))}
                  sx={{ borderRadius: '10px' }}>
                  {classrooms.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.1)' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Questions ({form.questions.length})
            </Typography>
            <Button size="small" startIcon={<Add />} onClick={addQuestion} variant="outlined"
              sx={{ borderRadius: '8px', borderColor: 'rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
              Add Question
            </Button>
          </Box>

          {form.questions.map((q, i) => (
            <Accordion key={i} defaultExpanded={i === 0}
              sx={{ mb: 1, background: 'rgba(30,41,59,0.5)', borderRadius: '12px !important', border: '1px solid rgba(148,163,184,0.1)', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', pr: 1 }}>
                  <Chip label={`Q${i + 1}`} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.2)', color: '#6366F1', minWidth: 40 }} />
                  <Typography variant="body2" sx={{ flex: 1, color: q.questionText ? '#F1F5F9' : '#64748B' }} noWrap>
                    {q.questionText || 'Enter question text...'}
                  </Typography>
                  <Chip label={`${q.points} pts`} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10B981' }} />
                  {form.questions.length > 1 && (
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeQuestion(i); }} sx={{ color: '#EF4444' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline rows={2} label="Question Text" value={q.questionText}
                      onChange={e => updateQuestion(i, 'questionText', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                  </Grid>
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <Grid item xs={12} sm={6} key={opt}>
                      <TextField fullWidth label={`Option ${opt}${opt === 'C' || opt === 'D' ? ' (optional)' : ''}`}
                        value={q[`option${opt}`]}
                        onChange={e => updateQuestion(i, `option${opt}`, e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            borderColor: q.correctOption === opt ? '#10B981' : undefined
                          }
                        }} />
                    </Grid>
                  ))}
                  <Grid item xs={6} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Correct Answer</InputLabel>
                      <Select value={q.correctOption} label="Correct Answer"
                        onChange={e => updateQuestion(i, 'correctOption', e.target.value)}
                        sx={{ borderRadius: '10px', color: '#10B981' }}>
                        {['A', 'B', 'C', 'D'].filter(o => o === 'A' || o === 'B' || q[`option${o}`]).map(o => (
                          <MenuItem key={o} value={o}>Option {o}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField fullWidth size="small" label="Points" type="number" value={q.points}
                      onChange={e => updateQuestion(i, 'points', parseInt(e.target.value) || 10)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Explanation (optional)" value={q.explanation}
                      onChange={e => updateQuestion(i, 'explanation', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: '10px' }}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ borderRadius: '10px', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', px: 3 }}>
            {saving ? 'Saving...' : 'Save Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizCreatorPage;
