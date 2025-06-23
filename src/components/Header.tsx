import Image from 'next/image';

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Image
            src="/logo-sweepstouch.png"
            alt="Sweepstouch Logo"
            width={40} // ajusta el tamaño a lo que necesites
            height={40}
          />

          <span className="logo-text">
            <span className="logo-sweeps">sweeps</span>
            <span className="logo-touch">TOUCH</span>
          </span>
        </div>
        <button className="apply-button">Aplicar Ahora</button>
      </div>
    </header>
  );
}
