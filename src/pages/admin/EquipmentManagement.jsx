import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip,
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, MenuItem,
  IconButton, Tooltip, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  VideoCameraFront as CameraIcon,
  Laptop as LaptopIcon,
  DevicesOther as OtherIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Build as MaintenanceIcon,
  HighlightOff as LostIcon
} from '@mui/icons-material';
import { getAllEquipment, createEquipment, deleteEquipment, updateEquipment } from '../../services/equipmentService';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const EquipmentManagement = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', type: '', serial_number: '', condition: 'New', status: 'available' });

  // Update Modal State
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchEquipment = async () => {
    try {
      const response = await getAllEquipment();
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (err) {
      toast.error('Ekipman listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleCreateSubmit = async () => {
    if (!newItem.name || !newItem.type) {
      toast.warning('Ad ve Tür alanları zorunludur.');
      return;
    }
    try {
      await createEquipment(newItem);
      toast.success('Ekipman eklendi.');
      setCreateOpen(false);
      setNewItem({ name: '', type: '', serial_number: '', condition: 'New', status: 'available' });
      fetchEquipment();
    } catch (err) {
      toast.error('Ekipman eklenemedi.');
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem.name || !selectedItem.type) {
      toast.warning('Ad ve Tür alanları zorunludur.');
      return;
    }
    try {
      await updateEquipment(selectedItem.id, selectedItem);
      toast.success('Ekipman güncellendi.');
      setUpdateOpen(false);
      setSelectedItem(null);
      fetchEquipment();
    } catch (err) {
      toast.error('Güncelleme başarısız.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ekipmanı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteEquipment(id);
      toast.success('Ekipman silindi.');
      fetchEquipment();
    } catch (err) {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const openUpdateModal = (item) => {
    setSelectedItem({ ...item });
    setUpdateOpen(true);
  };

  // Satır içi hızlı durum güncelleme (Admin Only)
  const handleQuickStatusChange = async (item, newStatus) => {
    try {
      await updateEquipment(item.id, { ...item, status: newStatus });
      toast.success('Durum güncellendi.');
      // Tüm listeyi çekmek yerine sadece o item'ı güncellemek daha performanslı olur ama şimdilik fetch
      fetchEquipment();
    } catch (err) {
      toast.error('Durum değiştirilemedi.');
    }
  };

  const getIcon = (type) => {
    if (type?.toLowerCase().includes('kamera')) return <CameraIcon />;
    if (type?.toLowerCase().includes('laptop') || type?.toLowerCase().includes('bilgisayar')) return <LaptopIcon />;
    return <OtherIcon />;
  };

  const getStatusChip = (status) => {
    let color = 'default';
    let icon = null;
    let label = status;

    switch (status) {
      case 'available':
        color = 'success';
        icon = <CheckIcon />;
        label = 'Müsait';
        break;
      case 'borrowed':
        color = 'warning';
        icon = <WarningIcon />;
        label = 'Ödünçte';
        break;
      case 'maintenance':
        color = 'error';
        icon = <MaintenanceIcon />;
        label = 'Bakımda';
        break;
      case 'lost':
        color = 'default';
        icon = <LostIcon />;
        label = 'Kayıp';
        break;
      default:
        color = 'default';
    }

    return <Chip label={label} color={color} size="small" icon={icon} sx={{ fontWeight: 600 }} />;
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            Envanter Yönetimi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Laboratuvar ve ders ekipmanlarını buradan takip edebilirsiniz.
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Yeni Ekipman
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Ekipman Adı</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Tür</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Seri No</TableCell>
                {isAdmin && <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>İşlem</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Envanterde kayıtlı ekipman yok.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, bgcolor: '#e0f2fe', color: '#0284c7', borderRadius: 2 }}>
                          {getIcon(item.type)}
                        </Box>
                        <Typography fontWeight={500}>{item.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                          <Select
                            value={item.status}
                            onChange={(e) => handleQuickStatusChange(item, e.target.value)}
                            disableUnderline
                            sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                          >
                            <MenuItem value="available" sx={{ color: 'success.main' }}>Müsait</MenuItem>
                            <MenuItem value="borrowed" sx={{ color: 'warning.main' }}>Ödünçte</MenuItem>
                            <MenuItem value="maintenance" sx={{ color: 'error.main' }}>Bakımda</MenuItem>
                            <MenuItem value="lost" sx={{ color: 'text.disabled' }}>Kayıp</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        getStatusChip(item.status)
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                        {item.serial_number || '-'}
                      </Typography>
                    </TableCell>

                    {isAdmin && (
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Düzenle">
                            <IconButton size="small" color="primary" onClick={() => openUpdateModal(item)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                )
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Yeni Ekipman Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Ekipman Ekle</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Ekipman Adı"
              fullWidth
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <TextField
              select
              label="Tür"
              fullWidth
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            >
              <MenuItem value="Laptop">Laptop</MenuItem>
              <MenuItem value="Kamera">Kamera</MenuItem>
              <MenuItem value="Projektör">Projektör</MenuItem>
              <MenuItem value="Tablet">Tablet</MenuItem>
              <MenuItem value="Diğer">Diğer</MenuItem>
            </TextField>
            <TextField
              label="Seri Numarası"
              fullWidth
              value={newItem.serial_number}
              onChange={(e) => setNewItem({ ...newItem, serial_number: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={newItem.status}
                label="Durum"
                onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
              >
                <MenuItem value="available">Müsait</MenuItem>
                <MenuItem value="borrowed">Ödünçte</MenuItem>
                <MenuItem value="maintenance">Bakımda</MenuItem>
                <MenuItem value="lost">Kayıp</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>İptal</Button>
          <Button onClick={handleCreateSubmit} variant="contained">Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Güncelleme Modalı */}
      <Dialog open={updateOpen} onClose={() => setUpdateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Ekipmanı Düzenle</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Ekipman Adı"
                fullWidth
                value={selectedItem.name}
                onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
              />
              <TextField
                select
                label="Tür"
                fullWidth
                value={selectedItem.type}
                onChange={(e) => setSelectedItem({ ...selectedItem, type: e.target.value })}
              >
                <MenuItem value="Laptop">Laptop</MenuItem>
                <MenuItem value="Kamera">Kamera</MenuItem>
                <MenuItem value="Projektör">Projektör</MenuItem>
                <MenuItem value="Tablet">Tablet</MenuItem>
                <MenuItem value="Diğer">Diğer</MenuItem>
              </TextField>
              <TextField
                label="Seri Numarası"
                fullWidth
                value={selectedItem.serial_number}
                onChange={(e) => setSelectedItem({ ...selectedItem, serial_number: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={selectedItem.status}
                  label="Durum"
                  onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })}
                >
                  <MenuItem value="available">Müsait</MenuItem>
                  <MenuItem value="borrowed">Ödünçte</MenuItem>
                  <MenuItem value="maintenance">Bakımda</MenuItem>
                  <MenuItem value="lost">Kayıp</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateOpen(false)}>İptal</Button>
          <Button onClick={handleUpdate} variant="contained">Güncelle</Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
};

export default EquipmentManagement;