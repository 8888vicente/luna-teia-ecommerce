'use client';

export default function HeroButton() {
  return (
    <button
      onClick={() => document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })}
      style={{ backgroundColor: '#E53935', color: 'white', padding: 'clamp(0.7rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', fontWeight: 'bold', borderRadius: '9999px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(229, 57, 53, 0.4)', transition: 'transform 0.2s', display: 'inline-block' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(-50%) translateY(-3px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(-50%) translateY(0)')}
    >
      Explorar Tienda
    </button>
  );
}
