import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Tab,
    Tabs,
    IconButton,
    Tooltip,
    LinearProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    Event as EventIcon,
    Restaurant as MealIcon,
    Warning as WarningIcon,
    Refresh as RefreshIcon,
    CheckCircle as SuccessIcon
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
    AreaChart,
    Area
} from 'recharts';
import Layout from '../../components/Layout';
import analyticsService from '../../services/analyticsService';
import { toast } from 'react-toastify';

// Renk paleti
const COLORS = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16'];

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `4px solid ${color}`
    }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: `${color}20`,
                    color
                }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [overview, setOverview] = useState(null);
    const [registrationTrend, setRegistrationTrend] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [mealStats, setMealStats] = useState(null);
    const [academicStats, setAcademicStats] = useState(null);
    const [systemHealth, setSystemHealth] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewRes, trendRes, attendanceRes, mealRes, academicRes, healthRes] = await Promise.all([
                analyticsService.getOverview(),
                analyticsService.getRegistrationTrend(30),
                analyticsService.getAttendanceStats(),
                analyticsService.getMealStats(),
                analyticsService.getAcademicStats(),
                analyticsService.getSystemHealth()
            ]);

            if (overviewRes.success) setOverview(overviewRes.data);
            if (trendRes.success) setRegistrationTrend(trendRes.data);
            if (attendanceRes.success) setAttendanceStats(attendanceRes.data);
            if (mealRes.success) setMealStats(mealRes.data);
            if (academicRes.success) setAcademicStats(academicRes.data);
            if (healthRes.success) setSystemHealth(healthRes.data);
        } catch (error) {
            console.error('Dashboard veri yükleme hatası:', error);
            toast.error('Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sistem genel görünümü ve istatistikler
                    </Typography>
                </Box>
                <Tooltip title="Yenile">
                    <IconButton onClick={fetchData} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Sistem Sağlığı */}
            {systemHealth && (
                <Alert
                    severity={systemHealth.database === 'healthy' ? 'success' : 'error'}
                    icon={systemHealth.database === 'healthy' ? <SuccessIcon /> : <WarningIcon />}
                    sx={{ mb: 3 }}
                >
                    <strong>Sistem Durumu:</strong> {systemHealth.database === 'healthy' ? 'Sağlıklı' : 'Sorun Var'} |
                    Son 1 saat: {systemHealth.lastHourActivity?.logins || 0} giriş,
                    {systemHealth.lastHourActivity?.attendanceRecords || 0} yoklama |
                    Son 24 saat: {systemHealth.last24HoursActivity?.newUsers || 0} yeni kullanıcı
                </Alert>
            )}

            {/* Genel İstatistikler */}
            {overview && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Toplam Kullanıcı"
                            value={overview.users?.total || 0}
                            icon={<PeopleIcon />}
                            color="#4f46e5"
                            subtitle={`${overview.users?.students || 0} öğrenci, ${overview.users?.faculty || 0} akademisyen`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Toplam Ders"
                            value={overview.academic?.courses || 0}
                            icon={<SchoolIcon />}
                            color="#10b981"
                            subtitle={`${overview.academic?.sections || 0} şube aktif`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Etkinlikler"
                            value={overview.events?.total || 0}
                            icon={<EventIcon />}
                            color="#8b5cf6"
                            subtitle={`${overview.events?.upcoming || 0} yaklaşan`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Bugünkü Yemek"
                            value={overview.meals?.todayReservations || 0}
                            icon={<MealIcon />}
                            color="#f59e0b"
                            subtitle="rezervasyon"
                        />
                    </Grid>
                </Grid>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable">
                    <Tab label="Kayıt Trendi" />
                    <Tab label="Yoklama" />
                    <Tab label="Akademik" />
                    <Tab label="Yemek" />
                </Tabs>
            </Paper>

            {/* Tab İçerikleri */}
            <Grid container spacing={3}>
                {/* Kayıt Trendi */}
                {activeTab === 0 && (
                    <>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Son 30 Günde Yeni Kayıtlar
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={registrationTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                                        />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Area type="monotone" dataKey="count" stroke="#4f46e5" fill="#4f46e580" name="Kayıt" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {overview?.users?.byRole && (
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Rol Dağılımı
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={overview.users.byRole.map(r => ({ name: r.role, value: parseInt(r.count) }))}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                dataKey="value"
                                            >
                                                {overview.users.byRole.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        )}
                    </>
                )}

                {/* Yoklama */}
                {activeTab === 1 && attendanceStats && (
                    <>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Yoklama Durumu
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Katılım</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {attendanceStats.stats?.present || 0}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={attendanceStats.stats?.total > 0 ? (attendanceStats.stats.present / attendanceStats.stats.total * 100) : 0}
                                        sx={{ mb: 2, height: 8, borderRadius: 4 }}
                                        color="success"
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Geç Gelme</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {attendanceStats.stats?.late || 0}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={attendanceStats.stats?.total > 0 ? (attendanceStats.stats.late / attendanceStats.stats.total * 100) : 0}
                                        sx={{ mb: 2, height: 8, borderRadius: 4 }}
                                        color="warning"
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Şüpheli</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {attendanceStats.stats?.flagged || 0}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={attendanceStats.stats?.total > 0 ? (attendanceStats.stats.flagged / attendanceStats.stats.total * 100) : 0}
                                        sx={{ mb: 2, height: 8, borderRadius: 4 }}
                                        color="error"
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Son 7 Gün Yoklama Trendi
                                </Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={attendanceStats.dailyDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { weekday: 'short' })}
                                        />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Bar dataKey="count" fill="#4f46e5" name="Yoklama" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </>
                )}

                {/* Akademik */}
                {activeTab === 2 && academicStats && (
                    <>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    GPA Dağılımı
                                </Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={academicStats.gpaDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="range" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Bar dataKey="count" fill="#10b981" name="Öğrenci Sayısı" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Kayıt Durumu
                                </Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={academicStats.enrollmentStatus?.map(s => ({
                                                name: s.status === 'enrolled' ? 'Kayıtlı' : s.status === 'dropped' ? 'Bıraktı' : s.status,
                                                value: parseInt(s.count)
                                            })) || []}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                            dataKey="value"
                                        >
                                            {academicStats.enrollmentStatus?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </>
                )}

                {/* Yemek */}
                {activeTab === 3 && mealStats && (
                    <>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Öğün Dağılımı
                                </Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={mealStats.mealTypeDistribution?.map(m => ({
                                                name: m.meal_type === 'lunch' ? 'Öğle' : 'Akşam',
                                                value: parseInt(m.count)
                                            })) || []}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                            dataKey="value"
                                        >
                                            {mealStats.mealTypeDistribution?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Kullanım Durumu
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <Card sx={{ bgcolor: '#10b98120', textAlign: 'center', p: 2 }}>
                                            <Typography variant="h3" fontWeight={700} color="#10b981">
                                                {mealStats.usageStats?.used || 0}
                                            </Typography>
                                            <Typography variant="body2">Kullanıldı</Typography>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ bgcolor: '#f59e0b20', textAlign: 'center', p: 2 }}>
                                            <Typography variant="h3" fontWeight={700} color="#f59e0b">
                                                {mealStats.usageStats?.pending || 0}
                                            </Typography>
                                            <Typography variant="body2">Bekliyor</Typography>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ bgcolor: '#ef444420', textAlign: 'center', p: 2 }}>
                                            <Typography variant="h3" fontWeight={700} color="#ef4444">
                                                {mealStats.usageStats?.cancelled || 0}
                                            </Typography>
                                            <Typography variant="body2">İptal</Typography>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ bgcolor: '#4f46e520', textAlign: 'center', p: 2 }}>
                                            <Typography variant="h3" fontWeight={700} color="#4f46e5">
                                                {mealStats.usageStats?.total || 0}
                                            </Typography>
                                            <Typography variant="body2">Toplam</Typography>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Haftalık Rezervasyon Trendi
                                </Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={mealStats.dailyTrend || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { weekday: 'short' })}
                                        />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="Rezervasyon" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </>
                )}
            </Grid>
        </Layout>
    );
};

export default AdminDashboard;
