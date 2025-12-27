import { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Button,
    ButtonGroup,
    Divider,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
    FormGroup,
    Grid,
    Tooltip
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    CheckCircle as SuccessIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    School as AcademicIcon,
    AccessTime as AttendanceIcon,
    Restaurant as MealIcon,
    Event as EventIcon,
    Payment as PaymentIcon,
    Settings as SystemIcon,
    Delete as DeleteIcon,
    DoneAll as ReadAllIcon,
    DeleteSweep as ClearAllIcon,
    Settings as SettingsIcon,
    Markunread as UnreadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import notificationService from '../services/notificationService';

// Kategori ikonları
const categoryIcons = {
    academic: <AcademicIcon />,
    attendance: <AttendanceIcon />,
    meal: <MealIcon />,
    event: <EventIcon />,
    payment: <PaymentIcon />,
    system: <SystemIcon />
};

// Kategori renkleri
const categoryColors = {
    academic: '#4f46e5',
    attendance: '#ec4899',
    meal: '#ff9800',
    event: '#9c27b0',
    payment: '#4caf50',
    system: '#6b7280'
};

// Kategori isimleri
const categoryNames = {
    academic: 'Akademik',
    attendance: 'Yoklama',
    meal: 'Yemek',
    event: 'Etkinlik',
    payment: 'Ödeme',
    system: 'Sistem'
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [activeTab, setActiveTab] = useState('all');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [preferences, setPreferences] = useState(null);
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const navigate = useNavigate();

    // Bildirimleri yükle
    const fetchNotifications = async (page = 1, category = null) => {
        try {
            setLoading(true);
            const params = { page, limit: 20 };
            if (category && category !== 'all' && category !== 'unread') {
                params.category = category;
            }
            if (category === 'unread') {
                params.is_read = false;
            }

            const response = await notificationService.getNotifications(params);
            if (response.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
                setPagination({
                    page: response.data.pagination.page,
                    totalPages: response.data.pagination.totalPages
                });
            }
        } catch (error) {
            toast.error('Bildirimler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    // Tercihleri yükle
    const fetchPreferences = async () => {
        try {
            setPreferencesLoading(true);
            const response = await notificationService.getPreferences();
            if (response.success) {
                setPreferences(response.data);
            }
        } catch (error) {
            toast.error('Tercihler yüklenemedi');
        } finally {
            setPreferencesLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Tab değiştiğinde
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        fetchNotifications(1, newValue);
    };

    // Bildirimi okundu işaretle
    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    // Tümünü okundu işaretle
    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success('Tüm bildirimler okundu olarak işaretlendi');
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    // Bildirimi sil
    const handleDelete = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            toast.success('Bildirim silindi');
        } catch (error) {
            toast.error('Silme işlemi başarısız');
        }
    };

    // Tümünü sil
    const handleClearAll = async () => {
        if (!window.confirm('Tüm bildirimler silinecek. Emin misiniz?')) return;

        try {
            await notificationService.clearAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
            toast.success('Tüm bildirimler silindi');
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    // Tercihleri güncelle
    const handlePreferenceChange = async (field, value) => {
        try {
            const newPreferences = { ...preferences, [field]: value };
            setPreferences(newPreferences);
            await notificationService.updatePreferences({ [field]: value });
        } catch (error) {
            toast.error('Tercih güncellenemedi');
        }
    };

    // Bildirime tıkla
    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    // Tarih formatla
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Layout>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight={700}>
                        Bildirimler
                    </Typography>
                    {unreadCount > 0 && (
                        <Chip
                            label={`${unreadCount} okunmamış`}
                            color="error"
                            size="small"
                        />
                    )}
                </Box>
                <Box>
                    <Tooltip title="Ayarlar">
                        <IconButton onClick={() => { setSettingsOpen(true); fetchPreferences(); }}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ReadAllIcon />}
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                >
                    Tümünü Okundu İşaretle
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ClearAllIcon />}
                    onClick={handleClearAll}
                    disabled={notifications.length === 0}
                >
                    Tümünü Sil
                </Button>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Tümü" value="all" />
                    <Tab
                        label={`Okunmamış (${unreadCount})`}
                        value="unread"
                        icon={<UnreadIcon />}
                        iconPosition="start"
                    />
                    <Tab label="Akademik" value="academic" />
                    <Tab label="Yoklama" value="attendance" />
                    <Tab label="Yemek" value="meal" />
                    <Tab label="Etkinlik" value="event" />
                    <Tab label="Ödeme" value="payment" />
                    <Tab label="Sistem" value="system" />
                </Tabs>
            </Paper>

            {/* Notification List */}
            <Paper>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Bildirim bulunamadı
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {notifications.map((notification, index) => (
                            <Box key={notification.id}>
                                <ListItem
                                    button
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        backgroundColor: notification.is_read ? 'transparent' : 'rgba(79, 70, 229, 0.04)',
                                        borderLeft: `4px solid ${categoryColors[notification.category] || '#6b7280'}`,
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.04)'
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        {categoryIcons[notification.category]}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography fontWeight={notification.is_read ? 400 : 600}>
                                                    {notification.title}
                                                </Typography>
                                                <Chip
                                                    label={categoryNames[notification.category]}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: categoryColors[notification.category],
                                                        color: 'white',
                                                        fontSize: '0.7rem',
                                                        height: 20
                                                    }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                                    {formatDate(notification.createdAt)}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Sil">
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < notifications.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <ButtonGroup variant="outlined" size="small">
                            <Button
                                disabled={pagination.page === 1}
                                onClick={() => fetchNotifications(pagination.page - 1, activeTab)}
                            >
                                Önceki
                            </Button>
                            <Button disabled>
                                {pagination.page} / {pagination.totalPages}
                            </Button>
                            <Button
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => fetchNotifications(pagination.page + 1, activeTab)}
                            >
                                Sonraki
                            </Button>
                        </ButtonGroup>
                    </Box>
                )}
            </Paper>

            {/* Settings Dialog */}
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon />
                        Bildirim Tercihleri
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {preferencesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : preferences ? (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Email Preferences */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    E-posta Bildirimleri
                                </Typography>
                                <FormGroup>
                                    {Object.keys(categoryNames).map(category => (
                                        <FormControlLabel
                                            key={`email_${category}`}
                                            control={
                                                <Switch
                                                    checked={preferences[`email_${category}`] ?? true}
                                                    onChange={(e) => handlePreferenceChange(`email_${category}`, e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={categoryNames[category]}
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>

                            {/* Push Preferences */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    Uygulama İçi Bildirimler
                                </Typography>
                                <FormGroup>
                                    {Object.keys(categoryNames).map(category => (
                                        <FormControlLabel
                                            key={`push_${category}`}
                                            control={
                                                <Switch
                                                    checked={preferences[`push_${category}`] ?? true}
                                                    onChange={(e) => handlePreferenceChange(`push_${category}`, e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={categoryNames[category]}
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>
                        </Grid>
                    ) : (
                        <Alert severity="error">Tercihler yüklenemedi</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default Notifications;

