import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import api from '../services/api'; // Axios instance'ımız
import { toast } from 'react-toastify';

const EmailVerification = () => {
  const { token } = useParams(); // URL'den token'ı al
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Backend API'ye istek at
        // NOT: Backend'deki endpoint POST methodu bekliyor
        await api.post('/auth/verify-email', { token });
        
        setStatus('success');
        setMessage('E-posta başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...');
        toast.success('E-posta adresiniz başarıyla doğrulandı!');
        
        // 3 saniye sonra Login'e at
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error) {
        setStatus('error');
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Doğrulama başarısız. Token geçersiz veya süresi dolmuş.';
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('Doğrulama kodu bulunamadı.');
      toast.error('Doğrulama kodu bulunamadı.');
    }
  }, [token, navigate]);

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 3,
          padding: 4,
          borderRadius: 2,
          backgroundColor: 'white',
          textAlign: 'center'
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Hesabınız doğrulanıyor...</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Başarılı!</Typography>
            <Alert severity="success">{message}</Alert>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Hata!</Typography>
            <Alert severity="error">{message}</Alert>
          </>
        )}
      </Box>
    </Container>
  );
};

export default EmailVerification;