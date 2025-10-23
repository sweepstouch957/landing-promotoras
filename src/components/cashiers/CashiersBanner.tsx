'use client';
import Image from 'next/image';

export default function CashiersBanner() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.3rem 1rem 0' }}>
            <div style={{ width: '100%', maxWidth: 1000 }}>
                <Image
                    src="/bannaer.png"
                    alt="Cashier promotion banner"
                    width={1172}
                    height={579}
                    priority
                    sizes="(max-width: 1024px) 100vw, 1000px"
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                />
            </div>
        </div>
    );
}
