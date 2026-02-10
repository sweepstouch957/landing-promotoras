'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-contact">
          <h4>{t('footer_contact_title')}</h4>
          <p>{t('footer_contact_text')}</p>

          <div className="contact-item">
            <span className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v2l-10 6L2 6V4zm0 4.236l9.684 5.81a1 1 0 001.04 0L22 8.236V20a2 2 0 01-2 2H4a2 2 0 01-2-2V8.236z" />
              </svg>
            </span>
            <span>{t('footer_email')}</span>
          </div>

          <div className="contact-item">
            <span className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.05-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.4a1 1 0 01-1 1A17.93 17.93 0 012 4a1 1 0 011-1h3.4a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.05l-2.13 2.13z" />
              </svg>
            </span>
            <span>{t('footer_phone')}</span>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-logo">
            <Image
              src="/logo-sweepstouch.png"
              alt="Sweepstouch logo"
              width={32}
              height={32}
            />
            <span className="logo-text">
              sweeps<span className="highlight">TOUCH</span>
            </span>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">
              {t('footer_terms')}
            </a>
            <a href="#" className="footer-link">
              {t('footer_privacy')}
            </a>
            <a href="#" className="footer-link">
              {t('footer_contact')}
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Sweepstouch. {t('footer_copyright')}</p>
      </div>
    </footer>
  );
}
