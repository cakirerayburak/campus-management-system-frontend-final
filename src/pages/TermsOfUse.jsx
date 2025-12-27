import React from 'react';
import { Container, Typography, Box, Paper, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TermsOfUse = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            window.close();
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 5 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ mb: 3 }}
            >
                {window.history.length > 1 ? 'Geri Dön' : 'Pencereyi Kapat'}
            </Button>

            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
                    Kullanım Koşulları
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                    Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        1. Giriş
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Bu Kampüs Yönetim Sistemi'ne ("Platform") hoş geldiniz. Platformu kullanarak, aşağıda belirtilen şartlar ve koşulları kabul etmiş olursunuz.
                        Eğer bu şartları kabul etmiyorsanız, lütfen Platformu kullanmayınız.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        2. Hizmetin Kapsamı
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Bu Platform, üniversite öğrencileri, akademik personel ve idari çalışanlar için ders yönetimi, not görüntüleme,
                        yoklama takibi, etkinlik rezervasyonu ve diğer kampüs hizmetlerine erişim sağlamak amacıyla tasarlanmıştır.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        3. Kullanıcı Sorumlulukları
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <ul>
                            <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayınız.</li>
                            <li>Platform üzerinden yapılan tüm işlemlerden kullanıcı sorumludur.</li>
                            <li>Sistemi, yürürlükteki yasalara ve üniversite yönetmeliklerine aykırı amaçlarla kullanamazsınız.</li>
                            <li>Sisteme zarar verecek, işleyişini aksatacak yazılım veya işlemlerden kaçınmalısınız.</li>
                        </ul>
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        4. Gizlilik ve Veri Güvenliği
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Kişisel verileriniz, KVKK (Kişisel Verilerin Korunması Kanunu) ve ilgili mevzuat çerçevesinde işlenmekte ve korunmaktadır.
                        Verileriniz yalnızca eğitim-öğretim faaliyetlerinin sürdürülmesi amacıyla kullanılacaktır.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        5. Fikri Mülkiyet
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Platform üzerindeki tüm logolar, tasarımlar, yazılımlar ve içerikler üniversitenin veya lisans verenlerinin mülkiyetindedir
                        ve telif hakkı yasaları ile korunmaktadır. İzinsiz kopyalanması veya kullanılması yasaktır.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        6. Değişiklikler
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Yönetim, bu kullanım koşullarını önceden haber vermeksizin değiştirme hakkını saklı tutar.
                        Değişiklikler yayınlandığı tarihte yürürlüğe girer. Platformu kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        7. İletişim
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Kullanım koşulları ile ilgili sorularınız için Öğrenci İşleri veya Bilgi İşlem Daire Başkanlığı ile iletişime geçebilirsiniz.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default TermsOfUse;
