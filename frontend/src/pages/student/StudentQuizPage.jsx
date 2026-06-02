import { useState, useEffect } from 'react';
import { quizService } from '../../services/dataService';
import {
  Box, Typography, Card, Grid, Button, Chip, CircularProgress,
  RadioGroup, FormControlLabel, Radio, LinearProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Quiz, CheckCircle, Timer, ArrowBack, ArrowForward } from '@mui/icons-material';

const StudentQuizPage = () => {
  const [view, setView] = useState('list'); // list | attempt | result
  const [quizzes, setQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [attemptsRes] = await Promise.all([quizService.getMyAttempts()]);
      setMyAttempts(attemptsRes.data?.data || []);
    } catch {
      setMyAttempts([]);
    }
    setLoading(false);
  };

  const loadQuizDetail = async (quizId) => {
    try {
      const res = await quizService.getById(quizId);
      const quiz = res.data?.data;
      setSelectedQuiz(quiz);
      setCurrentQ(0);
      setAnswers({});
      setError('');
      setView('attempt');
    } catch {
      setError('Failed to load quiz. Please try again.');
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setConfirmSubmit(false);
    setSubmitting(true);
    setError('');
    try {
      const res = await quizService.submitAttempt({ quizId: selectedQuiz.id, answers });
      setResult(res.data?.data);
      setView('result');
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAttemptForQuiz = (quizId) =>
    myAttempts.find(a => String(a.quizId) === String(quizId));

  const answeredCount = selectedQuiz
    ? selectedQuiz.questions?.filter(q => answers[q.id]).length
    : 0;

  // ── LIST VIEW ──────────────────────────────────────────────
  if (view === 'list') {
    return (
      <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>My Quizzes</Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 4 }}>
          Attempt quizzes assigned to your classrooms
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : myAttempts.length === 0 ? (
          <Card sx={{ p: 5, textAlign: 'center', borderRadius: '16px', background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)' }}>
            <Quiz sx={{ fontSize: 56, color: '#4F46E5', opacity: 0.4, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No Quizzes Yet</Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Quizzes assigned to your classrooms will appear here.
            </Typography>
          </Card>
        ) : (
          <>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Attempted Quizzes</Typography>
            <Grid container spacing={2}>
              {myAttempts.map((attempt, i) => (
                <Grid item xs={12} sm={6} md={4} key={attempt.id}>
                  <Card sx={{
                    p: 3, borderRadius: '16px',
                    background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                    animation: `fadeInUp 0.4s ease forwards`, animationDelay: `${i * 0.08}s`, opacity: 0,
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F1F5F9' }}>
                        {attempt.quizTitle}
                      </Typography>
                      <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>Score</Typography>
                        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
                          {attempt.score}/{attempt.totalMarks} ({attempt.percentage?.toFixed(0)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={attempt.percentage || 0}
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(16,185,129,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 3 } }}
                      />
                    </Box>
                    <Chip
                      label={attempt.percentage >= 60 ? 'Passed' : 'Needs Improvement'}
                      size="small"
                      sx={{
                        bgcolor: attempt.percentage >= 60 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: attempt.percentage >= 60 ? '#10B981' : '#EF4444',
                        fontSize: '0.7rem', fontWeight: 600,
                      }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    );
  }

  // ── ATTEMPT VIEW ───────────────────────────────────────────
  if (view === 'attempt' && selectedQuiz) {
    const questions = selectedQuiz.questions || [];
    const q = questions[currentQ];
    const options = q ? [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean) : [];
    const progress = questions.length ? ((currentQ + 1) / questions.length) * 100 : 0;

    return (
      <Box sx={{ animation: 'fadeIn 0.4s ease', maxWidth: 720, mx: 'auto' }}>
        <Button startIcon={<ArrowBack />} onClick={() => setView('list')} sx={{ mb: 3, color: '#94A3B8' }}>
          Back to Quizzes
        </Button>

        {/* Header */}
        <Card sx={{ p: 3, mb: 3, borderRadius: '16px', background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedQuiz.title}</Typography>
            <Chip icon={<Timer sx={{ fontSize: 16 }} />} label={`${selectedQuiz.durationMinutes} min`}
              size="small" sx={{ bgcolor: 'rgba(79,70,229,0.12)', color: '#6366F1' }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Question {currentQ + 1} of {questions.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {answeredCount}/{questions.length} answered
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress}
            sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(79,70,229,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#6366F1', borderRadius: 3 } }} />
        </Card>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

        {/* Question */}
        {q && (
          <Card sx={{ p: 3, mb: 3, borderRadius: '16px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.1)' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 3, lineHeight: 1.7 }}>
              {currentQ + 1}. {q.questionText}
            </Typography>
            <RadioGroup value={answers[q.id] || ''} onChange={(e) => handleAnswer(q.id, e.target.value)}>
              {options.map((opt, idx) => (
                <FormControlLabel
                  key={idx} value={opt} control={<Radio sx={{ color: '#4F46E5', '&.Mui-checked': { color: '#6366F1' } }} />}
                  label={opt}
                  sx={{
                    mb: 1, p: 1.5, borderRadius: '10px', border: '1px solid',
                    borderColor: answers[q.id] === opt ? 'rgba(99,102,241,0.4)' : 'rgba(148,163,184,0.1)',
                    bgcolor: answers[q.id] === opt ? 'rgba(99,102,241,0.08)' : 'transparent',
                    '&:hover': { borderColor: 'rgba(99,102,241,0.3)', bgcolor: 'rgba(99,102,241,0.05)' },
                    mx: 0, transition: 'all 0.2s',
                  }}
                />
              ))}
            </RadioGroup>
          </Card>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button startIcon={<ArrowBack />} onClick={() => setCurrentQ(q => q - 1)} disabled={currentQ === 0}
            sx={{ color: '#94A3B8' }}>
            Previous
          </Button>

          {currentQ < questions.length - 1 ? (
            <Button endIcon={<ArrowForward />} variant="contained" onClick={() => setCurrentQ(q => q + 1)}
              sx={{ borderRadius: '10px', bgcolor: '#4F46E5' }}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={() => setConfirmSubmit(true)} disabled={submitting}
              sx={{ borderRadius: '10px', bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Quiz'}
            </Button>
          )}
        </Box>

        {/* Confirm Dialog */}
        <Dialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)}
          PaperProps={{ sx: { borderRadius: '16px', background: '#1E293B', border: '1px solid rgba(148,163,184,0.15)' } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Submit Quiz?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && ` ${questions.length - answeredCount} question(s) unanswered.`}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConfirmSubmit(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ── RESULT VIEW ────────────────────────────────────────────
  if (view === 'result' && result) {
    const passed = result.percentage >= 60;
    return (
      <Box sx={{ animation: 'fadeIn 0.4s ease', maxWidth: 560, mx: 'auto', textAlign: 'center' }}>
        <Card sx={{ p: 5, borderRadius: '24px', background: 'rgba(30,41,59,0.9)', border: `1px solid ${passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
            bgcolor: passed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: passed ? '#10B981' : '#EF4444' }}>
              {result.percentage?.toFixed(0)}%
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            {passed ? '🎉 Great Job!' : '📚 Keep Practicing!'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>{result.quizTitle}</Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 4 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#6366F1' }}>{result.score}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>Score</Typography>
            </Box>
            <Box sx={{ width: 1, bgcolor: 'rgba(148,163,184,0.15)' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#94A3B8' }}>{result.totalMarks}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>Total</Typography>
            </Box>
          </Box>

          <LinearProgress variant="determinate" value={result.percentage || 0}
            sx={{ height: 10, borderRadius: 5, mb: 4, bgcolor: 'rgba(148,163,184,0.1)', '& .MuiLinearProgress-bar': { bgcolor: passed ? '#10B981' : '#EF4444', borderRadius: 5 } }} />

          <Button variant="contained" onClick={() => setView('list')} fullWidth
            sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, bgcolor: '#4F46E5' }}>
            Back to Quizzes
          </Button>
        </Card>
      </Box>
    );
  }

  return null;
};

export default StudentQuizPage;
