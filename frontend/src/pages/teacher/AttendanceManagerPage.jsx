import { useState, useEffect } from 'react';
import { attendanceService, classroomService } from '../../services/dataService';
import {
  Box, Typography, Card, Button, Chip, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup, TextField
} from '@mui/material';
import { CheckCircle, Cancel, Schedule, Save, CalendarMonth } from '@mui/icons-material';

const STATUS_CONFIG = {
  PRESENT: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
  ABSENT:  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  icon: <Cancel sx={{ fontSize: 16 }} /> },
  LATE:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: <Schedule sx={{ fontSize: 16 }} /> },
};

const AttendanceManagerPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadClassrooms(); }, []);
  useEffect(() => { if (selectedClassroom) loadData(); }, [selectedClassroom, date]);

  const loadClassrooms = async () => {
    try {
      const res = await classroomService.getMyClassrooms();
      const list = res.data?.data || [];
      setClassrooms(list);
      if (list.length > 0) setSelectedClassroom(list[0].id);
    } catch { setClassrooms([]); }
  };

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        classroomService.getStudents(selectedClassroom),
        attendanceService.getByDate(selectedClassroom, date),
      ]);
      const studentList = studentsRes.data?.data || [];
      const existingRecords = attendanceRes.data?.data || [];
      setStudents(studentList);
      setExisting(existingRecords);
      const init = {};
      studentList.forEach(s => {
        const rec = existingRecords.find(r => r.studentId === String(s.id));
        init[s.id] = rec?.status || 'PRESENT';
      });
      setAttendance(init);
    } catch { setStudents([]); setAttendance({}); }
    setLoading(false);
  };

  const setAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttendance(updated);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const records = students.map(s => ({ studentId: s.id, status: attendance[s.id] || 'PRESENT', remarks: '' }));
      await attendanceService.mark({ classroomId: Number(selectedClassroom), date, records });
      setSuccess('Attendance saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.response?.data?.message || 'Failed to save attendance.'); }
    setSaving(false);
  };

  const counts = students.reduce((acc, s) => {
    const st = attendance[s.id] || 'PRESENT';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Attendance Manager</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Mark and track student attendance</Typography>
        </Box>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
          onClick={handleSave} disabled={saving || students.length === 0} sx={{ borderRadius: '12px', py: 1.2 }}>
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 260 }}>
          <InputLabel>Classroom</InputLabel>
          <Select value={selectedClassroom} label="Classroom" onChange={e => setSelectedClassroom(e.target.value)} sx={{ borderRadius: '12px' }}>
            {classrooms.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField type="date" label="Date" value={date} onChange={e => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
      </Box>

      {/* Summary */}
      {students.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
            <Card key={status} sx={{ px: 3, py: 1.5, borderRadius: '12px', background: cfg.bg, border: `1px solid ${cfg.color}25`, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: cfg.color }}>{counts[status] || 0} {status}</Typography>
            </Card>
          ))}
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B' }}>Mark all:</Typography>
            {['PRESENT', 'ABSENT', 'LATE'].map(s => (
              <Button key={s} size="small" onClick={() => setAll(s)}
                sx={{ borderRadius: '8px', fontSize: '0.7rem', color: STATUS_CONFIG[s].color, bgcolor: STATUS_CONFIG[s].bg, '&:hover': { bgcolor: STATUS_CONFIG[s].bg } }}>
                {s}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : students.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.12)' }}>
          <CalendarMonth sx={{ fontSize: 64, color: '#0EA5E9', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No Students Found</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Students will appear here once they join this classroom.</Typography>
        </Card>
      ) : (
        <TableContainer component={Card} sx={{ borderRadius: '16px', border: '1px solid rgba(148,163,184,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: '#94A3B8', borderBottom: '1px solid rgba(148,163,184,0.1)', bgcolor: 'rgba(15,23,42,0.5)' } }}>
                <TableCell>#</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, i) => (
                <TableRow key={s.id} sx={{ '& td': { borderBottom: '1px solid rgba(148,163,184,0.06)' }, '&:hover': { bgcolor: 'rgba(148,163,184,0.03)' } }}>
                  <TableCell sx={{ color: '#64748B' }}>{i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#F1F5F9' }}>{s.fullName}</TableCell>
                  <TableCell sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>{s.email}</TableCell>
                  <TableCell align="center">
                    <ToggleButtonGroup exclusive value={attendance[s.id] || 'PRESENT'} onChange={(_, val) => val && setAttendance(prev => ({ ...prev, [s.id]: val }))} size="small">
                      {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                        <ToggleButton key={status} value={status} sx={{
                          px: 2, fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${cfg.color}30 !important`,
                          '&.Mui-selected': { bgcolor: `${cfg.bg} !important`, color: `${cfg.color} !important` },
                          color: '#64748B',
                        }}>
                          {status}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AttendanceManagerPage;
