'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { Switch } from '@mui/material';
import { styled } from '@mui/material/styles';
import styles from '../styles/header.module.css';




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
      transition: theme.transitions.create(['transform'], {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }),
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
          // Bandera de USA (cuando está en inglés)
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23B22234"/><rect width="32" height="2.46" y="0" fill="%23FFFFFF"/><rect width="32" height="2.46" y="4.92" fill="%23FFFFFF"/><rect width="32" height="2.46" y="9.84" fill="%23FFFFFF"/><rect width="32" height="2.46" y="14.76" fill="%23FFFFFF"/><rect width="32" height="2.46" y="19.68" fill="%23FFFFFF"/><rect width="32" height="2.46" y="24.6" fill="%23FFFFFF"/><rect width="32" height="2.46" y="29.52" fill="%23FFFFFF"/><rect width="12.8" height="17.22" fill="%233C3B6E"/></svg>')`,
          transform: 'scale(1.02)',
          boxShadow: '0 4px 12px rgba(224, 16, 112, 0.4)',
        },
      },
      '&:not(.Mui-checked) + .MuiSwitch-track': {
        backgroundColor: '#e01070',
        opacity: 0.7,
        border: '2px solid #c00d5f',
        boxShadow: '0 0 8px rgba(224, 16, 112, 0.2)',
      },
      '&:hover': {
        backgroundColor: 'transparent',
        '& .MuiSwitch-thumb': {
          boxShadow: '0 6px 16px rgba(224, 16, 112, 0.5)',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: '#fff',
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: '2px solid #e01070',
      boxShadow: '0 4px 8px rgba(224, 16, 112, 0.3)',
      transition: theme.transitions.create(
        ['background-image', 'transform', 'box-shadow'],
        {
          duration: 800,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }
      ),
      // Bandera de España (cuando está en español - posición inicial)
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23c60b1e"/><rect width="32" height="10.67" y="10.67" fill="%23ffc400"/><g transform="translate(8,16)"><rect width="8" height="6" fill="%23c60b1e"/><rect width="6" height="4" x="1" y="1" fill="%23ffc400"/><rect width="4" height="2" x="2" y="2" fill="%23c60b1e"/></g></svg>')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transform: 'scale(1)',
    },
    '& .MuiSwitch-track': {
      borderRadius: 20,
      backgroundColor: '#e01070',
      opacity: 0.7,
      border: '2px solid #c00d5f',
      boxShadow: '0 0 8px rgba(224, 16, 112, 0.2)',
      transition: theme.transitions.create(
        ['background-color', 'border-color', 'box-shadow', 'opacity'],
        {
          duration: 800,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
