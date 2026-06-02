import { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { aiService } from '../../services/dataService';
import {
  Box, Grid, Typography, Card, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Chip, IconButton, Tabs, Tab
} from '@mui/material';
import {
  AutoStories, Calculate, RecordVoiceOver, VolumeUp, Refresh, Psychology
} from '@mui/icons-material';

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];
const NUMERACY_TOPICS = ['addition', 'subtraction', 'multiplication', 'shapes', 'counting', 'fractions'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const FLNLearningHub = () => {
  const { speak } = useAccessibility();
  const [tab, setTab] = useState(0);
  const [language, setLanguage] = useState('English');

  // Numeracy state
  const [numeracyTopic, setNumeracyTopic] = useState('addition');
  const [ageGroup, setAgeGroup] = useState(8);
  const [numeracyStory, setNumeracyStory] = useState('');
  const [numeracyLoading, setNumeracyLoading] = useState(false);

  // Reading level state
  const [readingText, setReadingText] = useState('');
  const [readingLevel, setReadingLevel] = useState('');
  const [readingLoading, setReadingLoading] = useState(false);

  // Phonics state
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [phonicsResult, setPhonicsResult] = useState('');
  const [phonicsLoading, setPhonicsLoading] = useState(false);

  const handleNumeracyStory = async () => {
    setNumeracyLoading(true);
    try {
      const res = await aiService.generateNumeracyStory(ageGroup, numeracyTopic, language);
      setNumeracyStory(res.data?.data || '');
    } catch {
      setNumeracyStory(`Riya has 5 ${numeracyTopic === 'addition' ? 'mangoes' : 'books'}. Her friend gives her 3 more. How many does she have now?`);
    }
    setNumeracyLoading(false);
  };

  const handleReadingLevel = async () => {
    if (!readingText.trim()) return;
    setReadingLoading(true);
    try {
      const res = await aiService.assessReadingLevel(readingText);
      setReadingLevel(res.data?.data || '');
    } catch {
      setReadingLevel('Elementary (Grade 3-4)');
    }
    setReadingLoading(false);
  };

  const handlePhonics = async (letter) => {
    setSelectedLetter(letter);
    setPhonicsLoading(true);
    try {
      const res = await aiService.generatePhonics(letter, language);
      setPhonicsResult(res.data?.data || '');
    } catch {
      setPhonicsResult(`'${letter}' makes a fun sound! Find something starting with ${letter} around you.`);
    }
    setPhonicsLoading(false);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            <Psychology sx={{ mr: 1, verticalAlign: 'middle', color: '#8B5CF6' }} />
            FLN Learning Hub
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            AI-powered Foundational Literacy & Numeracy tools
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Language</InputLabel>
          <Select value={language} label="Language" onChange={(e) => setLanguage(e.target.value)}
            sx={{ borderRadius: '10px' }}>
            {LANGUAGES.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3,
        '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' },
        '& .Mui-selected': { color: '#8B5CF6' },
        '& .MuiTabs-indicator': { backgroundColor: '#8B5CF6' },
      }}>
        <Tab icon={<Calculate sx={{ fontSize: 18 }} />} iconPosition="start" label="Numeracy Stories" />
        <Tab icon={<AutoStories sx={{ fontSize: 18 }} />} iconPosition="start" label="Reading Level" />
        <Tab icon={<RecordVoiceOver sx={{ fontSize: 18 }} />} iconPosition="start" label="Phonics" />
      </Tabs>

      {/* Tab 0: Numeracy Stories */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: '16px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Generate Story Problem</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Topic</InputLabel>
                <Select value={numeracyTopic} label="Topic" onChange={(e) => setNumeracyTopic(e.target.value)}>
                  {NUMERACY_TOPICS.map(t => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Age Group</InputLabel>
                <Select value={ageGroup} label="Age Group" onChange={(e) => setAgeGroup(e.target.value)}>
                  {[6, 7, 8, 9, 10, 11, 12].map(a => <MenuItem key={a} value={a}>Age {a}</MenuItem>)}
                </Select>
              </FormControl>
              <Button fullWidth variant="contained" onClick={handleNumeracyStory}
                disabled={numeracyLoading} startIcon={numeracyLoading ? <CircularProgress size={18} color="inherit" /> : <Refresh />}
                sx={{ borderRadius: '10px', py: 1.2, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>
                Generate Story
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, borderRadius: '16px', minHeight: 200,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(99,102,241,0.05))',
              border: '1px solid rgba(139,92,246,0.15)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Story Problem</Typography>
                {numeracyStory && (
                  <IconButton onClick={() => speak(numeracyStory)} sx={{ color: '#0EA5E9' }}>
                    <VolumeUp />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h6" sx={{ color: numeracyStory ? '#F1F5F9' : '#475569',
                lineHeight: 1.8, fontWeight: numeracyStory ? 500 : 400 }}>
                {numeracyStory || 'Click "Generate Story" to create an AI-powered math story problem for your students...'}
              </Typography>
              {numeracyStory && (
                <Chip label={`${numeracyTopic} • Age ${ageGroup} • ${language}`} size="small"
                  sx={{ mt: 2, bgcolor: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }} />
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Reading Level */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3, borderRadius: '16px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Paste Lesson Text</Typography>
              <TextField fullWidth multiline rows={8} value={readingText}
                onChange={(e) => setReadingText(e.target.value)}
                placeholder="Paste any lesson content here to assess its reading level for your students..."
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <Button variant="contained" onClick={handleReadingLevel}
                disabled={readingLoading || !readingText.trim()}
                startIcon={readingLoading ? <CircularProgress size={18} color="inherit" /> : <AutoStories />}
                sx={{ borderRadius: '10px', background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
                Assess Reading Level
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3, borderRadius: '16px', height: '100%',
              background: readingLevel ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.08))' : undefined,
              border: readingLevel ? '1px solid rgba(16,185,129,0.2)' : undefined }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Reading Level Result</Typography>
              {readingLevel ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', mb: 1 }}>
                    {readingLevel}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    This content is appropriate for students at this level.
                    Consider simplifying if your class is below this grade.
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2, borderRadius: '10px', color: '#8B5CF6', borderColor: 'rgba(139,92,246,0.3)' }}
                    onClick={() => speak(readingLevel)}>
                    <VolumeUp sx={{ mr: 1 }} /> Read Aloud
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  The AI will analyze your text and tell you which grade level it's suitable for,
                  helping you match content to your students' abilities.
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Phonics */}
      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: '16px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Select a Letter</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {ALPHABET.map(letter => (
                  <Button key={letter} variant={selectedLetter === letter ? 'contained' : 'outlined'}
                    onClick={() => handlePhonics(letter)}
                    sx={{
                      minWidth: 44, height: 44, borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
                      ...(selectedLetter === letter
                        ? { background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }
                        : { borderColor: 'rgba(139,92,246,0.2)', color: '#94A3B8' })
                    }}>
                    {letter}
                  </Button>
                ))}
              </Box>
              {phonicsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress sx={{ color: '#8B5CF6' }} />
                </Box>
              ) : phonicsResult ? (
                <Card sx={{ p: 3, borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))',
                  border: '1px solid rgba(139,92,246,0.15)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Chip label={`Letter: ${selectedLetter} • ${language}`} size="small"
                        sx={{ mb: 2, bgcolor: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }} />
                      <Typography variant="h6" sx={{ color: '#F1F5F9', lineHeight: 1.8 }}>
                        {phonicsResult}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => speak(phonicsResult)} sx={{ color: '#0EA5E9', ml: 2 }}>
                      <VolumeUp />
                    </IconButton>
                  </Box>
                </Card>
              ) : (
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  Click any letter above to generate an AI-powered phonics exercise in your selected language.
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default FLNLearningHub;
