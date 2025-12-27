import { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    Button,
    CircularProgress,
    Chip,
    ListItemIcon,
    ListItemText
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
    DoneAll as ReadAllIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';

// Kategori ikonlarını eşle
const categoryIcons = {
    academic: <AcademicIcon fontSize="small" color="primary" />,
    attendance: <AttendanceIcon fontSize="small" color="secondary" />,
    meal: <MealIcon fontSize="small" sx={{ color: '#ff9800' }} />,
    event: <EventIcon fontSize="small" sx={{ color: '#9c27b0' }} />,
    payment: <PaymentIcon fontSize="small" sx={{ color: '#4caf50' }} />,
    system: <SystemIcon fontSize="small" color="action" />
};

// Tip ikonlarını eşle
const typeIcons = {
    success: <SuccessIcon fontSize="small" sx={{ color: '#4caf50' }} />,
    warning: <WarningIcon fontSize="small" sx={{ color: '#ff9800' }} />,
    error: <ErrorIcon fontSize="small" sx={{ color: '#f44336' }} />,
    info: <InfoIcon fontSize="small" sx={{ color: '#2196f3' }} />
};

// Kategori renklerini eşle
const categoryColors = {
    academic: '#4f46e5',
    attendance: '#ec4899',
    meal: '#ff9800',
    event: '#9c27b0',
    payment: '#4caf50',
    system: '#6b7280'
};

const NotificationBell = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const open = Boolean(anchorEl);

    // Bildirimleri yükle
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications({ limit: 5 });
            if (response.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Bildirimler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    // Okunmamış sayısını güncelle
    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            if (response.success) {
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Okunmamış sayısı alınamadı:', error);
        }
    };

    // Component mount olduğunda ve periyodik olarak güncelle
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // 30 saniyede bir kontrol et
        return () => clearInterval(interval);
    }, []);

    // Menü açıldığında bildirimleri yükle
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        fetchNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Bildirimi okundu olarak işaretle ve yönlendir
    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.is_read) {
                await notificationService.markAsRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
            }

            if (notification.link) {
                navigate(notification.link);
                handleClose();
            }
        } catch (error) {
            console.error('Bildirim okundu işaretlenemedi:', error);
        }
    };

    // Tümünü okundu işaretle
    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Bildirimler okundu işaretlenemedi:', error);
        }
    };

    // Tüm bildirimleri görüntüle
    const handleViewAll = () => {
        navigate('/notifications');
        handleClose();
    };

    // Tarih formatla
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        return date.toLocaleDateString('tr-TR');
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                sx={{
                    ml: 1,
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    max={99}
                    sx={{
                        '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            minWidth: '18px',
                            height: '18px'
                        }
                    }}
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 480,
                        borderRadius: 2,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Header */}
                <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                        Bildirimler
                    </Typography>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            startIcon={<ReadAllIcon />}
                            onClick={handleMarkAllRead}
                            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                            Tümünü Oku
                        </Button>
                    )}
                </Box>
                <Divider />

                {/* Loading */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {/* Bildirim Listesi */}
                {!loading && notifications.length === 0 && (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">
                            Henüz bildiriminiz yok
                        </Typography>
                    </Box>
                )}

                {!loading && notifications.map((notification) => (
                    <MenuItem
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                            py: 1.5,
                            px: 2,
                            backgroundColor: notification.is_read ? 'transparent' : 'rgba(79, 70, 229, 0.04)',
                            borderLeft: notification.is_read ? 'none' : `3px solid ${categoryColors[notification.category] || '#4f46e5'}`,
                            '&:hover': {
                                backgroundColor: notification.is_read ? 'rgba(0,0,0,0.04)' : 'rgba(79, 70, 229, 0.08)'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            {categoryIcons[notification.category] || typeIcons[notification.type]}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                        variant="body2"
                                        fontWeight={notification.is_read ? 400 : 600}
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 200
                                        }}
                                    >
                                        {notification.title}
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {notification.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                                        {formatDate(notification.created_at)}
                                    </Typography>
                                </Box>
                            }
                        />
                    </MenuItem>
                ))}

                {/* Footer */}
                {!loading && notifications.length > 0 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 1 }}>
                            <Button
                                fullWidth
                                onClick={handleViewAll}
                                sx={{ textTransform: 'none' }}
                            >
                                Tüm Bildirimleri Görüntüle
                            </Button>
                        </Box>
                    </>
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;
