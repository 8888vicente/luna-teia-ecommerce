"use client";

interface ProductModalHeaderProps {
  onClose: () => void;
}

export default function ProductModalHeader({ onClose }: ProductModalHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.6rem 1rem 0.3rem', position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        width: '36px', height: '4px', borderRadius: '2px',
        backgroundColor: '#e0e0e0',
      }} />
      <button
        onClick={onClose}
        aria-label="Cerrar modal"
        style={{
          position: 'absolute', right: '1rem', top: '0.6rem',
          width: '38px', height: '38px', borderRadius: '50%',
          backgroundColor: '#f0f0f0', border: 'none', cursor: 'pointer',
          fontSize: '1.3rem', fontWeight: 'bold', color: '#333333',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 10,
          transition: 'all 0.2s ease',
        }}
      >×</button>
    </div>
  );
}
