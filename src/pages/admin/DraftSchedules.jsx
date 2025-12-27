import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Paper, Typography, Button, Box, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import {
  getDraftSchedules,
  approveDraftSchedule,
  rejectDraftSchedule
} from '../../services/scheduleService';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import DraftsIcon from '@mui/icons-material/Drafts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchedulePreview from '../../components/SchedulePreview';

const DraftSchedules = () => {
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);
  const [totalDrafts, setTotalDrafts] = useState(0);
  const [error, setError] = useState(null);
  
  // Filters
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  
  // Modals
  const [previewModal, setPreviewModal] = useState({ open: false, draft: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, draft: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (semester) params.semester = semester;
      if (year) params.year = year;
      
      const res = await getDraftSchedules(params);
      
      if (res.data.success) {
        setDrafts(res.data.data || []);
        setTotalDrafts(res.data.totalDrafts || 0);
      } else {
        setError(res.data.message || 'Taslaklar yüklenemedi');
      }
    } catch (err) {
      console.error('Taslak listeleme hatası:', err);
      setError(err.response?.data?.message || 'Taslaklar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [semester, year]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handlePreview = (draft) => {
    setPreviewModal({ open: true, draft });
  };

  const handleApprove = (draft) => {
    setConfirmModal({ open: true, type: 'approve', draft });
  };

  const handleReject = (draft) => {
    setConfirmModal({ open: true, type: 'reject', draft });
  };

  const confirmAction = async () => {
    const { type, draft } = confirmModal;
    if (!draft) return;

    try {
      setActionLoading(true);
      
      if (type === 'approve') {
        const res = await approveDraftSchedule(draft.batchId, { archiveExisting: true });
        if (res.data.success) {
          toast.success(res.data.message || 'Program başarıyla onaylandı!');
        } else {
          toast.error(res.data.message || 'Onaylama başarısız');
        }
      } else if (type === 'reject') {
        const res = await rejectDraftSchedule(draft.batchId);
        if (res.data.success) {
          toast.success(res.data.message || 'Taslak reddedildi ve silindi');
        } else {
          toast.error(res.data.message || 'Reddetme başarısız');
        }
      }
      
      setConfirmModal({ open: false, type: null, draft: null });
      fetchDrafts();
    } catch (err) {
      console.error(`${type} hatası:`, err);
      toast.error(err.response?.data?.message || `İşlem başarısız: ${type}`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScheduleCount = (draft) => {
    return draft.schedules?.length || draft.stats?.totalCourses || 0;
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <DraftsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Taslak Programlar
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDrafts}
            disabled={loading}
          >
            Yenile
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Otomatik oluşturulan ders programları önce <strong>taslak</strong> olarak kaydedilir.
            Bu sayfadan taslakları inceleyebilir, onaylayabilir veya reddedebilirsiniz.
          </Typography>
        </Alert>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Dönem</InputLabel>
                <Select
                  value={semester}
                  label="Dönem"
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Fall">Güz</MenuItem>
                  <MenuItem value="Spring">Bahar</MenuItem>
                  <MenuItem value="Summer">Yaz</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Yıl</InputLabel>
                <Select
                  value={year}
                  label="Yıl"
                  onChange={(e) => setYear(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {[2024, 2025, 2026].map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Chip
                label={`Toplam: ${totalDrafts} taslak`}
                color="primary"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : drafts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DraftsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Onay bekleyen taslak program bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Yeni program oluşturmak için "Ders Programı Oluştur" sayfasını kullanın.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Batch ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Oluşturulma Tarihi</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ders Sayısı</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Durum</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drafts.map((draft) => (
                  <TableRow key={draft.batchId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {draft.batchId?.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(draft.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={`${getScheduleCount(draft)} ders`}
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label="Taslak"
                        color="warning"
                        icon={<DraftsIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Önizle">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handlePreview(draft)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Onayla">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(draft)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reddet">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(draft)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Preview Modal */}
        <Dialog
          open={previewModal.open}
          onClose={() => setPreviewModal({ open: false, draft: null })}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <VisibilityIcon color="primary" />
              Program Önizleme
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {previewModal.draft && (
              <SchedulePreview
                schedules={previewModal.draft.schedules || []}
                stats={previewModal.draft.stats}
                batchId={previewModal.draft.batchId}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewModal({ open: false, draft: null })}>
              Kapat
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                setPreviewModal({ open: false, draft: null });
                handleApprove(previewModal.draft);
              }}
            >
              Onayla
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => {
                setPreviewModal({ open: false, draft: null });
                handleReject(previewModal.draft);
              }}
            >
              Reddet
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Modal */}
        <Dialog
          open={confirmModal.open}
          onClose={() => setConfirmModal({ open: false, type: null, draft: null })}
        >
          <DialogTitle>
            {confirmModal.type === 'approve' ? 'Programı Onayla' : 'Programı Reddet'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmModal.type === 'approve'
                ? 'Bu taslak programı onaylamak istediğinize emin misiniz? Onaylandığında mevcut aktif programlar arşivlenecektir.'
                : 'Bu taslak programı reddetmek istediğinize emin misiniz? Bu işlem geri alınamaz ve taslak silinecektir.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmModal({ open: false, type: null, draft: null })}
              disabled={actionLoading}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              color={confirmModal.type === 'approve' ? 'success' : 'error'}
              onClick={confirmAction}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} /> : null}
            >
              {confirmModal.type === 'approve' ? 'Onayla' : 'Reddet'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default DraftSchedules;
