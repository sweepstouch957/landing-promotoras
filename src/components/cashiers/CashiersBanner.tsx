'use client';
import Image from 'next/image';

export default function CashiersBanner() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 1000 }}>
                <Image
                    src="/cashiers-rewards-banner.png"
                    alt="Cashier promotion banner"
                    width={2039}
                    height={771}
                    priority
                    sizes="(max-width: 1024px) 100vw, 1000px"
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                />
            </div>
        </div>
    );
}
