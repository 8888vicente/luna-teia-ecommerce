"use client";

import React, { useEffect, useRef } from 'react';
import { useCart, Product } from '../context/CartContext';

interface ProductModalProps {
  product: Product & { description?: string };
  onClose: () => void;
}

// Descripciones por familia de color — marca natural "Mia Terra"
const DESCRIPTIONS: Record<string, string> = {
  // Rojos & Intensos
  'Pasion':       'Rojo vibrante que captura cada mirada. Formulado con aceite de argán y manteca de karité, brinda un acabado mate aterciopelado que hidrata mientras cuida tus labios durante todo el día.',
  'Cereza':       'Un rojo profundo con toque frutal. Enriquecido con extracto de cereza silvestre y vitamina E, este tono satinado nutre y protege tus labios con cada aplicación.',
  'Rojo Quemado': 'Intensidad oscura con alma cálida. Con aceites vegetales de origen sustentable, ofrece un color duradero y labios suaves sin resecamiento.',
  'Marte':        'Rojo terroso de profundidad única. Nuestra fórmula natural con cera de candelilla y aceite de jojoba lo hace perfectamente duradero y cómodo de llevar.',
  'Fresa':        'Rojo brillante con energía frutal. Hecho con extracto natural de fresa y aloe vera, cuida tus labios mientras los tine de un color delicioso y fresco.',
  'Coral':        'Entre el rojo y el naranja, este tono tropical es suave al tacto gracias a su fórmula con aceite de rosa mosqueta y manteca de mango.',
  'Naranja':      'Audaz y vibrante, este naranja puro está elaborado con extractos de cítricos naturales y vitamina C que nutren y dan brillo natural a tus labios.',
  'Naranja Mate': 'La intensidad del naranja en acabado mate sedoso. Con aceite de semilla de maracuyá y vitamina E, mantiene tus labios hidratados sin brillo excesivo.',
  'Tangerin':     'Naranja suave con dulzura cítrica. Formulado con mantequilla de cupuazú y extracto de mandarina, es perfecto para un look fresco y natural.',
  'Mamey':        'Tono cálido inspirado en la fruta tropical. Rico en aceite de mamey y antioxidantes naturales, protege y nutre tus labios con un color lleno de vida.',
  'Oro Sol':      'Un tono dorado único con destellos cálidos. Con mica natural y aceites botánicos, aporta luminosidad y suavidad en una sola pasada.',
  // Rosas & Fucsias
  'Fiusha':       'Fucsia intenso que no pasa desapercibido. Con pigmentos naturales y aceite de rosa de castilla, hidrata y define tus labios con un color que dura todo el día.',
  'Fiusha Mate':  'El fucsia de siempre, en acabado mate sin sequedad. Nuestra fórmula vegana con aceite de aguacate lo hace confortable y duradero.',
  'Rosa Neon':    'Rosa eléctrico para quienes se atreven. Con extracto de frambuesa y vitamina C, este tono vibrante cuida y protege mientras hace resaltar tu sonrisa.',
  'Rosa Mx':      'Un rosa mexicano lleno de orgullo y feminidad. Con aceites botánicos nativos y cera vegetal, aplica suave y queda preciso en cada contorno.',
  'Rose':         'Rosa clásico y elegante. Enriquecido con extracto de pétalos de rosa real y ácido hialurónico vegetal para labios suaves, nutridos y radiantes.',
  'Rosa Seda':    'Rosa suave como tela de seda. Con aceite de semilla de rosa silvestre y manteca de karité, este tono delicado cuida tus labios mientras los embellece.',
  'Palo Rosa':    'El nude rosado perfecto. Formulado con aceite de argán y ceramidas vegetales, es el aliado diario para labios naturalmente bellos y bien cuidados.',
  'Bugambilia':   'Inspirado en la flor emblema de México, este fucsia profundo lleva extracto floral real y aceite de jojoba para una aplicación suave y un color intenso.',
  'Anis':         'Rosa especiado con carácter único. Con aceite esencial de anís estrella y manteca de cacao, aporta un aroma sutil y una textura cremosa incomparable.',
  'Moon':         'Rosa lunar, suave y misterioso. Formulado con extracto de perla vegetal y aceite de noche, este tono romántico nutre tus labios mientras añade un toque de fantasía.',
  // Nudes & Oscuros
  'Nature':       'El nude más natural que existe. Con aceites botánicos de origen silvestre, este tono imita el color natural de tus labios para un look limpio, sano y auténtico.',
  'Secret':       'Nude cálido con secreto irresistible. Nuestra mezcla de manteca de karité y aceite de camellia lo hace cremoso, duradero y perfectamente discreto.',
  'Terra':        'Inspirado en la tierra que nos da todo. Con arcilla natural y aceites de semillas, este tono terroso cuida tus labios mientras los viste de elegancia natural.',
  'Caramelo':     'Dulce y cálido como el caramelo artesanal. Con manteca de cacao puro y aceite de almendra dulce, aporta suavidad extrema y un color delicioso.',
  'Moka':         'Café con leche en formato labial. Formulado con extracto de café verde y vitamina E, tonifica y protege mientras le da a tu look un toque sofisticado.',
  'Chocolate':    'Oscuro, profundo y absolutamente irresistible. Con aceite de cacao sin refinar y manteca de cacao puro, nutre intensamente mientras te viste de elegancia.',
  'Expresso':     'Para quienes aman los tonos oscuros y el buen café. Con extracto de grano de café y aceite de macadamia, este tono intenso es confort y estilo en uno.',
  'Cocoa':        'Marrón suave con calidez natural. Elaborado con polvo de cacao real y aceite de argán, perfecto para un look cotidiano lleno de naturalidad y sofisticación.',
  'Ciruela':      'Morado profundo con toque frutal. Con extracto de ciruela silvestre y vitamina A natural, este tono oscuro nutre y da volumen visual a tus labios.',
  'Blackberry':   'El más oscuro y audaz de la colección. Con pigmentos botánicos de zarzamora y aceite de semilla de uva, cuida tus labios con un color que habla solo.',
  'Purpura':      'Púrpura mágico de inspiración floral. Con extracto de lavanda y aceite de flor de loto, este tono único lleva aromaterapia natural directo a tus labios.',
  'Piñon':        'Nude avellana inspirado en el bosque. Con aceite de piñón real y extracto de cedro, este tono terroso cálido es la sofisticación natural hecha labial.',
  'Sombra Ceja Clara':  'Polvo compacto de definición suave, ideal para cejas con acabado natural y ligero. Da volumen y forma sin endurecer el trazo, con una textura aterciopelada que se difumina fácilmente.',
  'Sombra Ceja Media':  'Tono medio versátil para cejas bien definidas. Su fórmula mate se integra con el vello y la piel, ofreciendo un acabado impecable para un arco pulido y con movimiento.',
  'Sombra Ceja Negra':  'Tono profundo para mayor intensidad en cejas marcadas. Ideal para perfiles más oscuros o looks dramáticos, aporta definición precisa y un color uniforme de larga duración.',
  'Sombra Ceja Obscura': 'Color oscuro para cejas de presencia. Su fórmula resistente controla el brillo y fija el maquillaje sin opacar, entregando un acabado elegante y con un efecto natural.',
};

const DEFAULT_DESC = 'Formulado con ingredientes 100% naturales y aceites botánicos, este labial de la colección Mia Terra cuida y embellece tus labios. Sin parabenos, sin crueldad animal y con compromiso sustentable.';

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { items, addItem } = useCart();
  const cartQuantity = items.find(item => item.id === product.id)?.quantity ?? 0;
  const availableQuantity = product.stock !== undefined ? Math.max(0, product.stock - cartQuantity) : undefined;
  const isSoldOut = availableQuantity !== undefined && availableQuantity <= 0;

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const historyClosing = useRef(false);
  const historyPushed = useRef(false);
  // Nota: se eliminó la manipulación directa del historial para evitar
  // que navegaciones/rehidrataciones cierren el modal automáticamente.

  const description = DESCRIPTIONS[product.name] ?? DEFAULT_DESC;

  return (
    <>
      {/* Overlay oscuro */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          animation: 'fadeIn 0.35s ease-out'
        }}
      />

      {/* Tarjeta del modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        backgroundColor: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        width: 'min(90vw, 680px)',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
        animation: 'modalFlowIn 0.5s cubic-bezier(0.2, 1.15, 0.4, 1)'
      }}>

        {/* Header con foto */}
        <div style={{
          position: 'relative',
          height: 'clamp(120px, 25vh, 180px)',
          backgroundImage: `url(${product.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          {/* Degradado de foto a blanco */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(255,255,255,1) 100%)'
          }} />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              width: '36px', height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: 'none', cursor: 'pointer',
              fontSize: '1.2rem', fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#212121'
            }}
          >
            ×
          </button>

          {/* Burbuja de color */}
          <div style={{
            position: 'absolute', bottom: '-15px', left: '1rem',
            width: '40px', height: '40px',
            borderRadius: '50%',
            backgroundColor: product.colorHex,
            border: '2px solid #fff',
            boxShadow: `0 4px 12px ${product.colorHex}88`
          }} />
        </div>

        {/* Contenido */}
        <div style={{ padding: '1.25rem 1rem 1rem' }}>
          {/* Nombre + categoría */}
          <div style={{ marginLeft: '3rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#212121', margin: 0 }}>
              {product.name}
            </h2>
            <p style={{ fontSize: '0.7rem', color: '#9e9e9e', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0.1rem 0 0' }}>
              {product.category} · Mia Terra
            </p>
          </div>

          {/* Precio */}
          <p style={{ fontSize: '1.4rem', fontWeight: '800', color: '#E53935', margin: '0.5rem 0' }}>
            ${product.price} <span style={{ fontSize: '0.85rem', color: '#9e9e9e', fontWeight: '400' }}>MXN</span>
          </p>

          {/* Separador */}
          <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '0 0 0.5rem' }} />

          {/* Descripción */}
          <p style={{
            fontSize: '0.85rem',
            lineHeight: '1.4',
            color: '#424242',
            margin: '0 0 0.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {description}
          </p>

          {/* Badge natural */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
            {['🌿 Natural', '🐰 Vegano', '✨ Sin Parabenos'].map(tag => (
              <span key={tag} style={{
                fontSize: '0.65rem', fontWeight: '700',
                padding: '0.2rem 0.5rem',
                borderRadius: '9999px',
                backgroundColor: '#f1f8e9',
                color: '#558b2f',
                border: '1px solid #c5e1a5'
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Botón Agregar */}
          <button
            onClick={() => { addItem(product); onClose(); }}
            disabled={isSoldOut}
            style={{
              width: '100%',
              padding: '0.8rem',
              backgroundColor: isSoldOut ? '#9e9e9e' : '#E53935',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '800',
              cursor: isSoldOut ? 'not-allowed' : 'pointer',
              letterSpacing: '1px',
              boxShadow: isSoldOut ? 'none' : '0 4px 14px rgba(229,57,53,0.35)',
              transition: 'transform 0.1s ease',
              marginTop: '0.25rem',
              opacity: isSoldOut ? 0.7 : 1,
            }}
              onMouseDown={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(1)'; }}
          >
              [ + ] {isSoldOut ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalFlowIn {
          0% { opacity: 0; transform: translate(-50%, -40%) scale(0.92); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}} />
    </>
  );
}
