import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const handleSelect = (code: string) => {
    void i18n.changeLanguage(code);
    setAnchor(null);
  };

  return (
    <>
      <Tooltip title={t('common.language')}>
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
          <TranslateIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={i18n.resolvedLanguage === lang.code}
            onClick={() => handleSelect(lang.code)}
          >
            {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
