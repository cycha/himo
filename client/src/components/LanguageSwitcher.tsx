import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from './ui/button';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="sm"
      className="text-white hover:text-white hover:bg-slate-800"
      title={i18n.language === 'en' ? 'Switch to French' : 'Passer en anglais'}
    >
      <Globe className="h-4 w-4 mr-2" />
      {i18n.language === 'en' ? 'FR' : 'EN'}
    </Button>
  );
};

export default LanguageSwitcher;
