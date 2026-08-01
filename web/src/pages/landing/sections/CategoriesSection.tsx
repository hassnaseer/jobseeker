import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Stack, Typography } from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { getCategoryTree } from '@/api/categories';
import type { Category } from '@/types/domain';

export default function CategoriesSection() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategoryTree()
      .then((tree) => setCategories(tree.slice(0, 8)))
      .catch(() => undefined);
  }, []);

  if (categories.length === 0) return null;

  return (
    <Box id="categories" sx={{ bgcolor: 'background.paper', py: 10 }}>
      <Box sx={{ maxWidth: 1160, mx: 'auto', px: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
          {t('landing.categories.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 5 }}>
          {t('landing.categories.subtitle')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {categories.map((cat) => (
            <Paper
              key={cat.id}
              component={RouterLink}
              to={`/signup`}
              sx={{
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                textAlign: 'center',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow 160ms ease, transform 160ms ease',
                '&:hover': { boxShadow: '0 4px 16px rgba(30,20,80,0.08)', transform: 'translateY(-2px)' },
              }}
            >
              <Stack
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: 'rgba(91,95,239,0.08)',
                  color: 'primary.main',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CategoryOutlinedIcon fontSize="small" />
              </Stack>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
