import { useState, useEffect } from 'react';
import { lessonService, classroomService } from '../../services/dataService';
import {
  Box, Typography, Card, Grid, Button, Chip, CircularProgress, Alert,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, MenuBook, Visibility, VisibilityOff } from '@mui/icons-material';

const defaultForm = { title: '', content: '', summary: '', classroomId: '', isPublished: false };

const LessonManagerPage = () => {
  const [lessons, setLessons] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadClassrooms(); }, []);
  useEffect(() => { if (selectedClassroom) loadLessons(selectedClassroom); }, [selectedClassroom]);

  const loadClassrooms = async () => {
    try {
      const res = await classroomService.getMyClassrooms();
      const list = res.data?.data || [];
      setClassrooms(list);
      if (list.length > 0) setSelectedClassroom(list[0].id);
    } catch { setClassrooms([]); }
  };

  const loadLessons = async (classroomId) => {
    setLoading(true);
    try {
      const res = await lessonService.getByClassroom(classroomId);
      setLessons(res.data?.data || []);
    } catch { setLessons([]); }
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, classroomId: selectedClassroom });
    setError(''); setDialog(true);
  };

  const openEdit = (l) => {
    setEditing(l);
    setForm({ title: l.title, content: l.content, summary: l.summary || '', classroomId: l.classroomId, isPublished: l.isPublished });
    setError(''); setDialog(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, classroomId: Number(form.classroomId) };
      if (editing) await lessonService.update(editing.id, payload);
      else await lessonService.create(payload);
      setDialog(false);
      loadLessons(selectedClassroom);
      setSuccess(editing ? 'Lesson updated.' : 'Lesson created.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lesson?')) return;
    setDeleting(id);
    try {
      await lessonService.delete(id);
      setLessons(prev => prev.filter(l => l.id !== id));
      setSuccess('Lesson deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.response?.data?.message || 'Failed to delete.'); }
    setDeleting(null);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Lesson Manager</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Create and manage lesson content</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} disabled={!selectedClassroom} sx={{ borderRadius: '12px', py: 1.2 }}>
          New Lesson
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      <FormControl sx={{ mb: 4, minWidth: 280 }}>
        <InputLabel>Select Classroom</InputLabel>
        <Select value={selectedClassroom} label="Select Classroom" onChange={e => setSelectedClassroom(e.target.value)} sx={{ borderRadius: '12px' }}>
          {classrooms.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : lessons.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
          <MenuBook sx={{ fontSize: 64, color: '#10B981', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No Lessons Yet</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: '10px', mt: 1, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>
            Create First Lesson
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {lessons.map((l, i) => (
            <Grid item xs={12} sm={6} md={4} key={l.id}>
              <Card sx={{
                p: 3, borderRadius: '16px', background: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.12)',
                animation: `fadeInUp 0.4s ease forwards`, animationDelay: `${i * 0.08}s`, opacity: 0,
                '&:hover': { borderColor: 'rgba(16,185,129,0.3)', transform: 'translateY(-3px)' }, transition: 'all 0.2s',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F1F5F9', flex: 1 }}>{l.title}</Typography>
                  <Box>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(l)} sx={{ color: '#10B981' }}><Edit sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(l.id)} disabled={deleting === l.id} sx={{ color: '#EF4444' }}>
                      {deleting === l.id ? <CircularProgress size={16} /> : <Delete sx={{ fontSize: 18 }} />}
                    </IconButton></Tooltip>
                  </Box>
                </Box>
                {l.summary && <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1.5, fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{l.summary}</Typography>}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={l.isPublished ? <Visibility sx={{ fontSize: 13 }} /> : <VisibilityOff sx={{ fontSize: 13 }} />}
                    label={l.isPublished ? 'Published' : 'Draft'}
                    size="small"
                    sx={{ bgcolor: l.isPublished ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.1)', color: l.isPublished ? '#10B981' : '#64748B', fontSize: '0.7rem' }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748B', ml: 'auto' }}>
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth maxWidth="md"
        PaperProps={{ sx: { borderRadius: '16px', background: '#1E293B', border: '1px solid rgba(148,163,184,0.15)' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField fullWidth label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField fullWidth label="Summary" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
            <TextField fullWidth label="Content *" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} multiline rows={6} />
            <FormControlLabel control={<Switch checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} color="success" />} label="Publish immediately" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editing ? 'Save Changes' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonManagerPage;
