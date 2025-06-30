'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { Switch } from '@mui/material';
import { styled } from '@mui/material/styles';
import styles from '../styles/Header.module.css';

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation('common');
  const [language, setLanguage] = useState(i18n.language || 'es');

  const handleApplyClick = () => {
    router.push('/formulario');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLanguageToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);

    // Mantener el menú abierto en móvil
    // No cerrar el menú al hacer switch
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuOpen && !event.target.closest('.header')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const FlagSwitch = styled(Switch)(({ theme }) => ({
    width: 80,
    height: 40,
    padding: 4,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 4,
      transitionDuration: '500ms',
      transform: 'translateX(0px)',
      '&.Mui-checked': {
        transform: 'translateX(40px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: '#e8f4fd',
          opacity: 1,
          border: '2px solid #b3d9f2',
        },
        '& .MuiSwitch-thumb': {
          // Bandera de USA (cuando está en inglés)
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><pattern id="stars" x="0" y="0" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="3" fill="%233C3B6E"/><polygon points="2,0.5 2.3,1.5 1.3,1.5" fill="white"/></pattern></defs><rect width="32" height="32" fill="%23B22234"/><rect width="32" height="2.46" y="0" fill="%23FFFFFF"/><rect width="32" height="2.46" y="4.92" fill="%23FFFFFF"/><rect width="32" height="2.46" y="9.84" fill="%23FFFFFF"/><rect width="32" height="2.46" y="14.76" fill="%23FFFFFF"/><rect width="32" height="2.46" y="19.68" fill="%23FFFFFF"/><rect width="32" height="2.46" y="24.6" fill="%23FFFFFF"/><rect width="32" height="2.46" y="29.52" fill="%23FFFFFF"/><rect width="12.8" height="17.22" fill="%233C3B6E"/></svg>')`,
          transform: 'scale(1.05)',
        },
      },
      '&:not(.Mui-checked) + .MuiSwitch-track': {
        backgroundColor: '#ffeaa7',
        opacity: 1,
        border: '2px solid #fdcb6e',
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: '#fff',
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: '2px solid #ddd',
      boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
      transition: theme.transitions.create(['background-image', 'transform'], {
        duration: 500,
      }),
      // Bandera de España (cuando está en español - posición inicial)
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23c60b1e"/><rect width="32" height="10.67" y="10.67" fill="%23ffc400"/><g transform="translate(8,16)"><rect width="8" height="6" fill="%23c60b1e"/><rect width="6" height="4" x="1" y="1" fill="%23ffc400"/><rect width="4" height="2" x="2" y="2" fill="%23c60b1e"/></g></svg>')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transform: 'scale(1)',
    },
    '& .MuiSwitch-track': {
      borderRadius: 20,
      backgroundColor: '#ffeaa7',
      opacity: 1,
      border: '2px solid #fdcb6e',
      transition: theme.transitions.create(
        ['background-color', 'border-color'],
        {
          duration: 500,
        }
      ),
    },
  }));

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className={styles.logo}>
            <Image
              src="/logo-sweepstouch.png"
              alt="Sweepstouch Logo"
              width={40}
              height={40}
            />
            <span className={styles.logoText}>
              <span className={styles.logoSweeps}>sweeps</span>
              <span className={styles.logoTouch}>TOUCH</span>
            </span>
          </div>
        </Link>

        <button
          className={styles.hamburger}
          aria-label="Menu"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>

        <div className={styles.actions}>
          <div className={styles.languageSwitchContainer}>
            <FlagSwitch
              checked={language === 'en'}
              onChange={handleLanguageToggle}
              inputProps={{ 'aria-label': 'Language toggle' }}
            />
          </div>
          <button className={styles.applyButton} onClick={handleApplyClick}>
            {t('apply_now')}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
          <button
            className={`${styles.applyButton} ${styles.mobileApply}`}
            onClick={() => {
              handleApplyClick();
              setMenuOpen(false);
            }}
          >
            {t('apply_now')}
          </button>
          <div className={styles.mobileLanguageSwitch}>
            <FlagSwitch
              checked={language === 'en'}
              onChange={handleLanguageToggle}
              inputProps={{ 'aria-label': 'Language toggle' }}
            />
          </div>
        </nav>
      )}
    </header>
  );
}
