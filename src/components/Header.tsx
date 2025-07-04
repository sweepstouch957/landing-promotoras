'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { Switch } from '@mui/material';
import { styled } from '@mui/material/styles';
import styles from '@style/Header.module.css';
import AuthNavigation from './AuthNavigation';

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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuOpen &&
        !(event.target instanceof Element && event.target.closest('.header'))
      ) {
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

  const FlagSwitch = styled(Switch)(() => ({
    width: 80,
    height: 40,
    padding: 4,
    position: 'relative',
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 4,
      transition: 'transform 300ms ease-in-out',
      transform: 'translateX(0px)',
      '&.Mui-checked': {
        transform: 'translateX(40px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: '#e01070',
          opacity: 1,
          border: '2px solid #c00d5f',
          boxShadow: '0 0 10px rgba(224, 16, 112, 0.3)',
        },
        '& .MuiSwitch-thumb': {
          transform: 'scale(1)',
          boxShadow: '0 4px 10px rgba(224, 16, 112, 0.3)',
        },
      },
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: '#fff',
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: '2px solid #e01070',
      boxShadow: '0 4px 8px rgba(224, 16, 112, 0.3)',
      transition: 'all 300ms ease-in-out',
    },
    '& .MuiSwitch-track': {
      borderRadius: 20,
      backgroundColor: '#e01070',
      opacity: 0.7,
      border: '2px solid #c00d5f',
      boxShadow: '0 0 8px rgba(224, 16, 112, 0.2)',
      position: 'relative',
      transition: 'all 300ms ease-in-out',
      '&::before, &::after': {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fff',
      },
      '&::before': {
        content: '"ES"',
        left: 10,
      },
      '&::after': {
        content: '"EN"',
        right: 10,
      },
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
          <AuthNavigation />
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
