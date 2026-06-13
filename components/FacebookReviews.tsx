'use client';
import React from 'react';
import Link from 'next/link';

// Estos son datos de prueba, luego los reemplazaremos con las imágenes reales y sus links.
const REVIEWS = [
  { id: 1, image: '/recomendaciones/menciones1.jpg', url: 'https://www.facebook.com/miaterrasonora/posts/pfbid0wp7fjq9V4DxVcAbT2AaWGQxC3tKfWnh5GbvDm2zoysB5S12JWSboxMrmCFS6qd6ml', alt: 'Mención 1' },
  { id: 2, image: '/recomendaciones/menciones2.jpeg', url: 'https://www.facebook.com/miaterrasonora/posts/pfbid02E534JuAiSK7DFfU82fd3KGdfvxK1izasBrZ4FDubGyXeatc3fb7RTai8pBB5ZYKJl', alt: 'Mención 2' },
  { id: 3, image: '/recomendaciones/menciones3.jpeg', url: 'https://www.facebook.com/miaterrasonora/posts/pfbid084L4V1CVaz7t652YVJnr5ayiepWBYmZFdBjJ2iHBp6dgCrzG48vmdVFQYeWdQ2sxl', alt: 'Mención 3' },
  { id: 4, image: '/recomendaciones/menciones4.png', url: 'https://www.facebook.com/miaterrasonora/posts/pfbid02n1nXbAFGEAo3drFMZZbNrk6f67ViUh13XtswyC9rWoZCdjZQKWXhibVN5DunQpWRl', alt: 'Mención 4' },
  { id: 5, image: '/recomendaciones/menciones5.png', url: 'https://www.facebook.com/miaterrasonora', alt: 'Mención 5' },
];

export default function FacebookReviews() {
  return (
    <section style={{ padding: '4rem 0', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#212121', marginBottom: '0.5rem' }}>
          Lo que dicen de nosotros
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Conoce la experiencia de nuestros clientes. Desliza para ver más.
        </p>
      </div>

      <div className="reviews-carousel" style={{
        display: 'flex',
        gap: '1.5rem',
        padding: '1rem 2rem',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', // Para Firefox
        msOverflowStyle: 'none', // Para IE/Edge
      }}>
        {REVIEWS.map(review => (
          <Link key={review.id} href={review.url} target="_blank" rel="noopener noreferrer" style={{ flex: '0 0 auto', scrollSnapAlign: 'center', textDecoration: 'none' }}>
            <div style={{
              position: 'relative',
              width: '280px',
              height: '280px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer',
              backgroundColor: '#fff'
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.transform = 'translateY(-5px)'; 
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)'; 
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.transform = 'translateY(0)'; 
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; 
            }}
            >
              <img src={review.image} alt={review.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Icono de Facebook Permanente */}
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                backgroundColor: '#1877F2',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Ocultar la barra de scroll para navegadores webkit */
        .reviews-carousel::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
}
