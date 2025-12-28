import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container, Paper, Typography, Button, Box, Chip, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail, registerEvent } from '../services/eventService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { QRCodeSVG } from 'qrcode.react';

const EventDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registerModal, setRegisterModal] = useState({ open: false, customFields: {} });
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      const res = await getEventDetail(id);
      setEvent(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error(t('events.load_error'));
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await registerEvent(id, registerModal.customFields);
      setRegisterModal({ open: false, customFields: {} });
      fetchEventDetail(); // Kontenjan güncellemesi için
    } catch (error) {
      toast.error(error.response?.data?.error || t('events.register_failed'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography>{t('common.loading')}</Typography>
        </Container>
      </Layout>
    );
  }

  if (!event) {
    return null;
  }

  const isFull = event.registered_count >= event.capacity;
  const isDeadlinePassed = event.registration_deadline && new Date(event.registration_deadline) < new Date();
  const canRegister = !isFull && !isDeadlinePassed;

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/events')}
          sx={{ mb: 2 }}
        >
          {t('event_detail.back')}
        </Button>

        <Paper sx={{ p: 4, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
              {event.title}
            </Typography>
            <Chip label={event.category} color="primary" />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" color="text.secondary" paragraph>
            {event.description}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <EventIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">{t('event_detail.date')}</Typography>
                  <Typography variant="body1">
                    {new Date(event.date).toLocaleDateString(i18n.language, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">{t('event_detail.time')}</Typography>
                  <Typography variant="body1">
                    {event.start_time} - {event.end_time}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">{t('event_detail.location')}</Typography>
                  <Typography variant="body1">{event.location}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <PeopleIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">{t('event_detail.capacity')}</Typography>
                  <Typography
                    variant="body1"
                    color={isFull ? 'error.main' : 'success.main'}
                    fontWeight="bold"
                  >
                    {event.registered_count} / {event.capacity}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {event.is_paid && event.price > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('event_detail.paid_alert')} <strong>{event.price} ₺</strong>
            </Alert>
          )}

          {event.registration_deadline && (
            <Alert
              severity={isDeadlinePassed ? 'error' : 'warning'}
              sx={{ mt: 2 }}
            >
              {t('event_detail.deadline_alert')} {new Date(event.registration_deadline).toLocaleDateString(i18n.language)}
              {isDeadlinePassed && ` ${t('event_detail.deadline_passed')}`}
            </Alert>
          )}

          {isFull && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {t('event_detail.full_alert')}
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setRegisterModal({ open: true, customFields: {} })}
              disabled={!canRegister}
            >
              {isFull ? t('event_detail.full_btn') : isDeadlinePassed ? t('event_detail.expired_btn') : t('event_detail.register_btn')}
            </Button>
          </Box>
        </Paper>

        {/* Kayıt Başarı Modal */}
        {registrationSuccess && (
          <Dialog open={!!registrationSuccess} onClose={() => setRegistrationSuccess(null)} maxWidth="sm" fullWidth>
            <DialogTitle>{t('event_detail.success_title')}</DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                {registrationSuccess.qrCodeImage && (
                  <>
                    <QRCodeSVG value={registrationSuccess.qr_code || registrationSuccess.qrCodeImage} size={250} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {t('my_events.qr_desc')}
                    </Typography>
                  </>
                )}
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {t('event_detail.success_desc')}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setRegistrationSuccess(null);
                navigate('/my-events');
              }}>
                {t('event_detail.my_events_btn')}
              </Button>
              <Button variant="contained" onClick={() => setRegistrationSuccess(null)}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Kayıt Modal */}
        <Dialog open={registerModal.open} onClose={() => setRegisterModal({ open: false, customFields: {} })} maxWidth="sm" fullWidth>
          <DialogTitle>{t('event_detail.modal_title')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.title} {t('event_detail.modal_desc')}
            </Typography>
            {event.is_paid && event.price > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('event_detail.paid_alert')} {event.price} ₺
              </Alert>
            )}

            {/* Custom Fields Form */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('event_detail.extra_info')}
              </Typography>
              <TextField
                fullWidth
                label={t('event_detail.phone')}
                value={registerModal.customFields.phone || ''}
                onChange={(e) => setRegisterModal({
                  ...registerModal,
                  customFields: { ...registerModal.customFields, phone: e.target.value }
                })}
                sx={{ mb: 2 }}
                placeholder="5XX XXX XX XX"
              />
              <TextField
                fullWidth
                label={t('event_detail.notes')}
                value={registerModal.customFields.notes || ''}
                onChange={(e) => setRegisterModal({
                  ...registerModal,
                  customFields: { ...registerModal.customFields, notes: e.target.value }
                })}
                multiline
                rows={3}
                placeholder={t('event_detail.notes_placeholder')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegisterModal({ open: false, customFields: {} })}>
              {t('common.cancel')}
            </Button>
            <Button variant="contained" onClick={handleRegister}>
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default EventDetail;

