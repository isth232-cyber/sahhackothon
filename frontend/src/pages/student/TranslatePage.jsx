import { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { aiService } from '../../services/dataService';
import {
  Box, Grid, Typography, Card, CardContent, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, IconButton, Chip
} from '@mui/material';
import { Translate, VolumeUp, ContentCopy, SwapHoriz, AutoFixHigh } from '@mui/icons-material';

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

const TranslatePage = () => {
  const { speak } = useAccessibility();
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [translatedText, setTranslatedText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [simplifyLoading, setSimplifyLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await aiService.translate(inputText, targetLang);
      setTranslatedText(res.data?.data?.translatedText || 'Translation not available');
    } catch (e) {
      setTranslatedText(`[Mock ${targetLang} Translation] ${inputText}`);
    }
    setLoading(false);
  };

  const handleSimplify = async () => {
    if (!inputText.trim()) return;
    setSimplifyLoading(true);
    try {
      const res = await aiService.simplify(inputText, 'English');
      setSimplifiedText(res.data?.data?.simplifiedText || 'Simplified version not available');
    } catch (e) {
      setSimplifiedText(`Simply put: ${inputText.substring(0, 80)}...`);
    }
    setSimplifyLoading(false);
  };

  const copyText = (text) => navigator.clipboard.writeText(text);

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          <Translate sx={{ mr: 1, verticalAlign: 'middle', color: '#8B5CF6' }} />
          Multilingual Assistant
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>Translate and simplify lesson content in your preferred language</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Input */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '16px', p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F1F5F9' }}>Original Text</Typography>
              <Chip label="English" size="small" sx={{ bgcolor: 'rgba(79,70,229,0.15)', color: '#6366F1' }} />
            </Box>
            <TextField
              fullWidth multiline rows={8} value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter or paste lesson content here..."
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={() => speak(inputText)} sx={{ color: '#0EA5E9' }} title="Listen">
                <VolumeUp />
              </IconButton>
              <IconButton onClick={() => copyText(inputText)} sx={{ color: '#94A3B8' }} title="Copy">
                <ContentCopy />
              </IconButton>
            </Box>
          </Card>
        </Grid>

        {/* Translation Output */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '16px', p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F1F5F9' }}>Translation</Typography>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
                  sx={{ borderRadius: '10px', fontSize: '0.85rem' }}>
                  {LANGUAGES.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{
              minHeight: 200, p: 2, borderRadius: '12px', mb: 2,
              background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.1)',
            }}>
              <Typography variant="body1" sx={{ color: translatedText ? '#F1F5F9' : '#64748B', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {translatedText || 'Translation will appear here...'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => speak(translatedText)} sx={{ color: '#0EA5E9' }}><VolumeUp /></IconButton>
                <IconButton onClick={() => copyText(translatedText)} sx={{ color: '#94A3B8' }}><ContentCopy /></IconButton>
              </Box>
              <Button variant="contained" startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SwapHoriz />}
                onClick={handleTranslate} disabled={loading || !inputText.trim()}
                sx={{ borderRadius: '10px' }}>
                Translate
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Simplify Section */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: '16px', p: 3, background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(14,165,233,0.05))' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  <AutoFixHigh sx={{ mr: 1, verticalAlign: 'middle', color: '#8B5CF6' }} />
                  Explain in Simple Language
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>AI will simplify complex concepts for easier understanding</Typography>
              </Box>
              <Button variant="outlined" startIcon={simplifyLoading ? <CircularProgress size={18} /> : <AutoFixHigh />}
                onClick={handleSimplify} disabled={simplifyLoading || !inputText.trim()}
                sx={{ borderRadius: '10px', borderColor: 'rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
                Simplify
              </Button>
            </Box>
            {simplifiedText && (
              <Box sx={{ p: 2.5, borderRadius: '12px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <Typography variant="body1" sx={{ color: '#F1F5F9', lineHeight: 1.8 }}>{simplifiedText}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <IconButton size="small" onClick={() => speak(simplifiedText)} sx={{ color: '#0EA5E9' }}><VolumeUp fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => copyText(simplifiedText)} sx={{ color: '#94A3B8' }}><ContentCopy fontSize="small" /></IconButton>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TranslatePage;
