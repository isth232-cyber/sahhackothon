import { useState, useEffect } from 'react';
import { adminService } from '../../services/dataService';
import StatsCard from '../../components/StatsCard';
import {
  Box, Grid, Typography, Card, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, IconButton, Tooltip
} from '@mui/material';
import { People, School, AdminPanelSettings, Assessment, ToggleOn, ToggleOff } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({ totalTeachers: 0, totalStudents: 0, totalClassrooms: 0, totalUsers: 0 });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [analyticsRes, teacherRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getTeachers(),
      ]);
      setAnalytics(analyticsRes.data?.data || {});
      setTeachers(teacherRes.data?.data || []);
    } catch (e) {
      setAnalytics({ totalTeachers: 5, totalStudents: 120, totalClassrooms: 12, totalUsers: 127 });
      setTeachers([
        { id: 1, fullName: 'Demo Teacher', email: 'teacher@sahapathi.ai', phone: '9876543210', isActive: true },
        { id: 2, fullName: 'Anil Kumar', email: 'anil@school.edu', phone: '9876543212', isActive: true },
      ]);
    }
    setLoading(false);
  };

  const pieData = [
    { name: 'Teachers', value: analytics.totalTeachers || 5 },
    { name: 'Students', value: analytics.totalStudents || 120 },
  ];

  const barData = [
    { month: 'Jan', users: 45 }, { month: 'Feb', users: 62 },
    { month: 'Mar', users: 78 }, { month: 'Apr', users: 95 },
    { month: 'May', users: 127 },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Admin Dashboard</Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>Platform overview and management</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Users" value={analytics.totalUsers} icon={<People sx={{ color: '#4F46E5' }} />} color="#4F46E5" trend="up" trendValue="+15 this month" delay={0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Teachers" value={analytics.totalTeachers} icon={<AdminPanelSettings sx={{ color: '#10B981' }} />} color="#10B981" delay={0.1} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Students" value={analytics.totalStudents} icon={<People sx={{ color: '#0EA5E9' }} />} color="#0EA5E9" delay={0.2} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Classrooms" value={analytics.totalClassrooms} icon={<School sx={{ color: '#F59E0B' }} />} color="#F59E0B" delay={0.3} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: '16px', p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>User Distribution</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px', color: '#F1F5F9' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: '16px', p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>User Growth</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <RechartsTooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px', color: '#F1F5F9' }} />
                <Bar dataKey="users" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Teachers Table */}
      <Card sx={{ borderRadius: '16px', p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Teachers</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((t) => (
                <TableRow key={t.id} sx={{ '&:hover': { bgcolor: 'rgba(79,70,229,0.05)' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#4F46E5', fontSize: '0.8rem' }}>{t.fullName?.charAt(0)}</Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#F1F5F9' }}>{t.fullName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#94A3B8' }}>{t.email}</TableCell>
                  <TableCell sx={{ color: '#94A3B8' }}>{t.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip label={t.isActive ? 'Active' : 'Inactive'} size="small"
                      sx={{ bgcolor: t.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: t.isActive ? '#10B981' : '#EF4444', fontWeight: 600, fontSize: '0.7rem' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
