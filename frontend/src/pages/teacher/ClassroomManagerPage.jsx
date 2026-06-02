import { useState, useEffect } from 'react';
import { classroomService } from '../../services/dataService';
import {
  Box, Typography, Card, Grid, Button, Chip, CircularProgress, Alert,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, ContentCopy, People, MenuBook, Quiz, School } from '@mui/icons-material';

const defaultForm = { name: '', subject: '', grade: '', description: '' };

const ClassroomManagerPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await classroomService.getMyClassrooms();
      setClassrooms(res.data?.data || []);
    } catch { setClassrooms([]); }
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(defaultForm); setError(''); setDialog(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, subject: c.subject || '', grade: c.grade || '', description: c.description || '' }); setError(''); setDialog(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Classroom name is required.'); return; }
    setSaving(true); setError('');
    try {
      if (editing) {
        await classroomService.update(editing.id, form);
        setSuccess('Classroom updated.');
      } else {
        await classroomService.create(form);
        setSuccess('Classroom created.');
      }
      setDialog(false);
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this classroom?')) return;
    setDeleting(id);
    try {
      await classroomService.delete(id);
      setClassrooms(prev => prev.filter(c => c.id !== id));
      setSuccess('Classroom deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.response?.data?.message || 'Failed to delete.'); }
    setDeleting(null);
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Classroom Manager</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Create and manage your classrooms</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: '12px', py: 1.2 }}>
          New Classroom
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : classrooms.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)' }}>
          <School sx={{ fontSize: 64, color: '#4F46E5', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No Classrooms Yet</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: '10px', mt: 1 }}>Create First Classroom</Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {classrooms.map((c, i) => (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Card sx={{
                p: 3, borderRadius: '16px', background: 'rgba(79,70,229,0.05)',
                border: '1px solid rgba(79,70,229,0.12)',
                animation: `fadeInUp 0.4s ease forwards`, animationDelay: `${i * 0.08}s`, opacity: 0,
                '&:hover': { borderColor: 'rgba(79,70,229,0.3)', transform: 'translateY(-3px)' }, transition: 'all 0.2s',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F1F5F9', flex: 1 }}>{c.name}</Typography>
                  <Box>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(c)} sx={{ color: '#6366F1' }}><Edit sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(c.id)} disabled={deleting === c.id} sx={{ color: '#EF4444' }}>
                      {deleting === c.id ? <CircularProgress size={16} /> : <Delete sx={{ fontSize: 18 }} />}
                    </IconButton></Tooltip>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {c.subject && <Chip label={c.subject} size="small" sx={{ bgcolor: 'rgba(79,70,229,0.12)', color: '#6366F1', fontSize: '0.7rem' }} />}
                  {c.grade && <Chip label={`Grade ${c.grade}`} size="small" sx={{ bgcolor: 'rgba(14,165,233,0.12)', color: '#0EA5E9', fontSize: '0.7rem' }} />}
                  <Chip label={c.isActive ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: c.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.1)', color: c.isActive ? '#10B981' : '#64748B', fontSize: '0.7rem' }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}><People sx={{ fontSize: 13, mr: 0.5, verticalAlign: 'middle' }} />{c.studentCount}</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}><MenuBook sx={{ fontSize: 13, mr: 0.5, verticalAlign: 'middle' }} />{c.lessonCount}</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}><Quiz sx={{ fontSize: 13, mr: 0.5, verticalAlign: 'middle' }} />{c.quizCount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: '10px', bgcolor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Invite Code:</Typography>
                  <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.inviteCode}</Typography>
                  <Tooltip title={copied === c.id ? 'Copied!' : 'Copy'}>
                    <IconButton size="small" onClick={() => copyCode(c.inviteCode, c.id)} sx={{ ml: 'auto', color: copied === c.id ? '#10B981' : '#6366F1', p: 0.5 }}>
                      <ContentCopy sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '16px', background: '#1E293B', border: '1px solid rgba(148,163,184,0.15)' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Classroom' : 'Create Classroom'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField fullWidth label="Classroom Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              <TextField fullWidth label="Grade" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} />
            </Box>
            <TextField fullWidth label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editing ? 'Save Changes' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassroomManagerPage;
