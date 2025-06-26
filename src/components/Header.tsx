'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleApplyClick = () => {
    router.push('/formulario');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cerrar el menú cuando se hace clic fuera de él
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

  // Cerrar el menú cuando se redimensiona la ventana
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

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="logo">
            <Image
              src="/logo-sweepstouch.png"
              alt="Sweepstouch Logo"
              width={40}
              height={40}
            />
            <span className="logo-text">
              <span className="logo-sweeps">sweeps</span>
              <span className="logo-touch">TOUCH</span>
            </span>
          </div>
        </Link>

        {/* Botón hamburguesa solo visible en móvil */}
        <button
          className="hamburger"
          aria-label="Menu"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Botón aplicar, oculto en móvil */}
        <button className="apply-button" onClick={handleApplyClick}>
          Aplicar Ahora
        </button>
      </div>

      {/* Menú desplegable para móvil */}
      {menuOpen && (
        <nav className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <button
            className="apply-button"
            onClick={() => {
              handleApplyClick();
              setMenuOpen(false); // Cerrar el menú después de hacer clic
            }}
          >
            Aplicar Ahora
          </button>
        </nav>
      )}
    </header>
  );
}
