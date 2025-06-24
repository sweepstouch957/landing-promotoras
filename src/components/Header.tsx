'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleApplyClick = () => {
    router.push('/formulario'); // redirige a la ruta donde está el formulario
  };

  return (
    <header className="header">
      <div className="header-container">
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

        <button className="apply-button" onClick={handleApplyClick}>
          Aplicar Ahora
        </button>
      </div>
    </header>
  );
}
