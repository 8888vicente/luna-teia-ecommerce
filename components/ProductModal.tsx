"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCart, Product } from '../context/CartContext';

interface ProductModalProps {
  product: Product;
  products: Product[];            // lista completa para swipe
  onClose: () => void;
  onNavigate: (product: Product) => void;  // cambiar de producto
}

// ─── Descripciones por nombre ───
const DESCRIPTIONS: Record<string, string> = {
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
  'Sombra Ceja Clara':  'Polvo compacto de definición suave, ideal para cejas con acabado natural y ligero.',
  'Sombra Ceja Media':  'Tono medio versátil para cejas bien definidas. Acabado impecable para un arco pulido.',
  'Sombra Ceja Negra':  'Tono profundo para mayor intensidad en cejas marcadas. Definición precisa de larga duración.',
  'Sombra Ceja Obscura': 'Color oscuro para cejas de presencia. Acabado elegante con efecto natural.',
};

const DEFAULT_DESC = 'Formulado con ingredientes 100% naturales y aceites botánicos, este producto de la colección Mia Terra cuida y embellece. Sin parabenos, sin crueldad animal y con compromiso sustentable.';

// ════════════════════════════════════════════════════════════════
// Componente de visor fullscreen con pinch-to-zoom
// ════════════════════════════════════════════════════════════════
function FullscreenViewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastDistance = useRef<number | null>(null);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  // Reset zoom al abrir
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [src]);

  // Pinch-to-zoom
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastDistance.current !== null) {
        const delta = distance / lastDistance.current;
        setScale(prev => Math.min(5, Math.max(1, prev * delta)));
      }
      lastDistance.current = distance;
    } else if (e.touches.length === 1 && scale > 1) {
      // Panning cuando hay zoom
      const touch = e.touches[0];
      if (isDragging.current) {
        const dx = touch.clientX - dragStart.current.x;
        const dy = touch.clientY - dragStart.current.y;
        setTranslate({
          x: translateStart.current.x + dx,
          y: translateStart.current.y + dy,
        });
      }
    }
  }, [scale]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      translateStart.current = { ...translate };
    }
  }, [scale, translate]);

  const handleTouchEnd = useCallback(() => {
    lastDistance.current = null;
    isDragging.current = false;
    // Si vuelve a escala 1, resetear posición
    if (scale <= 1.05) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale]);

  // Doble tap para zoom toggle
  const lastTap = useRef(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Doble tap → toggle zoom
      if (scale > 1.5) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else {
        setScale(3);
      }
    }
    lastTap.current = now;
  }, [scale]);

  return (
    <div
      onClick={(e) => {
        if (scale <= 1) onClose();
        else handleTap();
        e.stopPropagation();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0,0,0,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        animation: 'fsIn 0.25s ease-out',
      }}
    >
      {/* Botón cerrar */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: 'absolute', top: '1rem', right: '1rem', zIndex: 2010,
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: 'white', fontSize: '1.3rem', fontWeight: 'bold',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}
      >×</button>

      {/* Indicador de zoom */}
      {scale > 1 && (
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 2010, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.3rem 0.8rem',
          borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backdropFilter: 'blur(4px)',
        }}>
          {Math.round(scale * 100)}% · Toca para cerrar
        </div>
      )}

      {/* Imagen con zoom */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          handleTap();
        }}
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          objectFit: 'contain',
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s ease-out',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Modal principal
// ════════════════════════════════════════════════════════════════
export default function ProductModal({ product, products, onClose, onNavigate }: ProductModalProps) {
  const { items, addItem } = useCart();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [imageGalleryIndex, setImageGalleryIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Swipe refs
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const galleryTouchStart = useRef<{ x: number; t: number } | null>(null);
  const historyPushed = useRef(false);
  const closingRef = useRef(false);

  // Cart info
  const cartQuantity = items.find(item => item.id === product.id)?.quantity ?? 0;
  const availableQuantity = product.stock !== undefined ? Math.max(0, product.stock - cartQuantity) : undefined;
  const isSoldOut = availableQuantity !== undefined && availableQuantity <= 0;

  // Imágenes del producto
  const productImages = [product.imageUrl];
  if (product.imageUrlSecondary && product.imageUrlSecondary !== product.imageUrl) {
    productImages.push(product.imageUrlSecondary);
  }

  // Descripción
  const description = DESCRIPTIONS[product.name] ?? DEFAULT_DESC;

  // Current product index in the list
  const currentIndex = products.findIndex(p => p.id === product.id);

  // Reset gallery index cuando cambia el producto
  useEffect(() => {
    setImageGalleryIndex(0);
    setSwipeOffset(0);
  }, [product.id]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Manejo del botón atrás (historial) en móviles
  useEffect(() => {
    window.history.pushState({ modalOpen: true }, '');
    historyPushed.current = true;

    const handlePopState = () => {
      closingRef.current = true;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (historyPushed.current && !closingRef.current) {
        if (window.history.state?.modalOpen) {
          window.history.back();
        }
      }
    };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenImage) setFullscreenImage(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, fullscreenImage]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ─── Swipe entre productos (en el modal completo) ───
  const handleModalTouchStart = useCallback((e: React.TouchEvent) => {
    // No interceptar si estamos en fullscreen
    if (fullscreenImage) return;
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, [fullscreenImage]);

  const handleModalTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || fullscreenImage) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;

    // Solo aplicar swipe horizontal si el movimiento es más horizontal que vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      setSwipeOffset(dx);
    }
  }, [fullscreenImage]);

  const handleModalTouchEnd = useCallback(() => {
    if (!touchStart.current) return;
    const threshold = 80;
    const elapsed = Date.now() - touchStart.current.t;
    const velocity = Math.abs(swipeOffset) / elapsed;

    if ((Math.abs(swipeOffset) > threshold || velocity > 0.5) && products.length > 1) {
      if (swipeOffset < 0 && currentIndex < products.length - 1) {
        // Swipe left → siguiente producto
        setIsTransitioning(true);
        setTimeout(() => {
          onNavigate(products[currentIndex + 1]);
          setIsTransitioning(false);
        }, 150);
      } else if (swipeOffset > 0 && currentIndex > 0) {
        // Swipe right → producto anterior
        setIsTransitioning(true);
        setTimeout(() => {
          onNavigate(products[currentIndex - 1]);
          setIsTransitioning(false);
        }, 150);
      }
    }
    setSwipeOffset(0);
    touchStart.current = null;
  }, [swipeOffset, currentIndex, products, onNavigate]);

  // ─── Swipe en galería de imágenes ───
  const handleGalleryTouchStart = useCallback((e: React.TouchEvent) => {
    if (productImages.length <= 1) return;
    galleryTouchStart.current = { x: e.touches[0].clientX, t: Date.now() };
    e.stopPropagation(); // evitar que el swipe de modal intercepte
  }, [productImages.length]);

  const handleGalleryTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!galleryTouchStart.current || productImages.length <= 1) return;
    e.stopPropagation();
    const dx = galleryTouchStart.current.x - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
      if (dx > 0 && imageGalleryIndex < productImages.length - 1) {
        setImageGalleryIndex(prev => prev + 1);
      } else if (dx < 0 && imageGalleryIndex > 0) {
        setImageGalleryIndex(prev => prev - 1);
      }
    }
    galleryTouchStart.current = null;
  }, [productImages.length, imageGalleryIndex]);

  return (
    <>
      {/* ── Overlay oscuro ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          animation: 'modalFadeIn 0.3s ease-out',
        }}
      />

      {/* ── Modal fullscreen-like (tall, scrollable) ── */}
      <div
        ref={modalRef}
        onClick={onClose}
        onTouchStart={handleModalTouchStart}
        onTouchMove={handleModalTouchMove}
        onTouchEnd={handleModalTouchEnd}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1001,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          animation: 'modalSlideUp 0.4s cubic-bezier(0.2, 1, 0.3, 1)',
          cursor: 'pointer',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '500px',
            height: '95vh',
            backgroundColor: '#fff',
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
            transform: isTransitioning
              ? `translateX(${swipeOffset < 0 ? '-30' : '30'}px) scale(0.97)`
              : `translateX(${swipeOffset * 0.4}px)`,
            opacity: isTransitioning ? 0.4 : 1,
            transition: isTransitioning
              ? 'transform 0.15s ease-out, opacity 0.15s ease-out'
              : swipeOffset === 0 ? 'transform 0.25s ease-out' : 'none',
            cursor: 'default',
          }}
        >
          {/* ── Handle de arrastre + close ── */}
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

          {/* ── Contenido scrollable ── */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>

            {/* ═══ SECCIÓN 1: GALERÍA DE IMÁGENES ═══ */}
            <div
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: '#fafafa',
                overflow: 'hidden',
              }}
            >
              {/* Track de imágenes */}
              <div style={{
                display: 'flex',
                width: `${productImages.length * 100}%`,
                height: '100%',
                transform: `translateX(-${imageGalleryIndex * (100 / productImages.length)}%)`,
                transition: 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
              }}>
                {productImages.map((src, i) => (
                  <div
                    key={i}
                    onClick={() => setFullscreenImage(src)}
                    style={{
                      width: `${100 / productImages.length}%`,
                      height: '100%',
                      cursor: 'zoom-in',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={src}
                      alt={`${product.name} - vista ${i + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Indicador de zoom */}
              <div style={{
                position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                background: 'rgba(0,0,0,0.5)', color: 'white',
                padding: '0.25rem 0.5rem', borderRadius: '6px',
                fontSize: '0.65rem', fontWeight: '700',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}>
                🔍 Toca para ampliar
              </div>

              {/* Dots indicadores (solo si hay >1 imagen) */}
              {productImages.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: '0.4rem', zIndex: 5,
                }}>
                  {productImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setImageGalleryIndex(i); }}
                      style={{
                        width: i === imageGalleryIndex ? '20px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: i === imageGalleryIndex ? '#E53935' : 'rgba(0,0,0,0.25)',
                        border: 'none', cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ═══ SECCIÓN 2: INFO DEL PRODUCTO ═══ */}
            <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>

              {/* Nombre + Burbuja de color */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: product.colorHex, border: '2px solid #fff',
                  boxShadow: `0 3px 10px ${product.colorHex}66`,
                  marginTop: '0.1rem',
                }} />
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#212121', margin: 0, lineHeight: 1.2 }}>
                    {product.name}
                  </h2>
                  <p style={{
                    fontSize: '0.72rem', color: '#9e9e9e', fontWeight: '600',
                    letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0.2rem 0 0',
                  }}>
                    {product.category} · Mia Terra
                  </p>
                </div>
              </div>

              {/* Precio */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.75rem 0' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#E53935' }}>
                  ${product.price}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#9e9e9e', fontWeight: '500' }}>MXN</span>
                {availableQuantity !== undefined && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.75rem', fontWeight: '700',
                    color: availableQuantity > 0 ? '#4CAF50' : '#f44336',
                    backgroundColor: availableQuantity > 0 ? '#E8F5E9' : '#FFEBEE',
                    padding: '0.2rem 0.5rem', borderRadius: '9999px',
                  }}>
                    {availableQuantity > 0 ? `${availableQuantity} disponibles` : 'Agotado'}
                  </span>
                )}
              </div>

              {/* Separador */}
              <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '0 0 0.75rem' }} />

              {/* ═══ SECCIÓN 3: DESCRIPCIÓN ═══ */}
              <p style={{
                fontSize: '0.9rem', lineHeight: '1.55', color: '#424242', margin: '0 0 0.75rem',
              }}>
                {description}
              </p>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0 0 1rem' }}>
                {['🌿 Natural', '🐰 Vegano', '✨ Sin Parabenos'].map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.68rem', fontWeight: '700',
                    padding: '0.25rem 0.6rem', borderRadius: '9999px',
                    backgroundColor: '#f1f8e9', color: '#558b2f',
                    border: '1px solid #c5e1a5',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Indicador de navegación */}
              {products.length > 1 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.75rem', margin: '0 0 0.5rem',
                  padding: '0.5rem', borderRadius: '12px',
                  backgroundColor: '#fafafa',
                }}>
                  <button
                    onClick={() => currentIndex > 0 && onNavigate(products[currentIndex - 1])}
                    disabled={currentIndex <= 0}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      backgroundColor: currentIndex > 0 ? '#f0f0f0' : 'transparent',
                      border: 'none', cursor: currentIndex > 0 ? 'pointer' : 'default',
                      fontSize: '1rem', color: currentIndex > 0 ? '#424242' : '#e0e0e0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >‹</button>
                  <span style={{ fontSize: '0.72rem', color: '#9e9e9e', fontWeight: '600' }}>
                    {currentIndex + 1} / {products.length} · Desliza para navegar
                  </span>
                  <button
                    onClick={() => currentIndex < products.length - 1 && onNavigate(products[currentIndex + 1])}
                    disabled={currentIndex >= products.length - 1}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      backgroundColor: currentIndex < products.length - 1 ? '#f0f0f0' : 'transparent',
                      border: 'none', cursor: currentIndex < products.length - 1 ? 'pointer' : 'default',
                      fontSize: '1rem', color: currentIndex < products.length - 1 ? '#424242' : '#e0e0e0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >›</button>
                </div>
              )}
            </div>
          </div>

          {/* ═══ SECCIÓN 4: BOTÓN AGREGAR (sticky bottom) ═══ */}
          <div style={{
            flexShrink: 0,
            padding: '0.75rem 1.25rem',
            paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
            borderTop: '1px solid #f0f0f0',
            backgroundColor: '#fff',
          }}>
            <button
              onClick={() => { addItem(product); onClose(); }}
              disabled={isSoldOut}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: isSoldOut ? '#9e9e9e' : '#E53935',
                color: 'white', border: 'none', borderRadius: '14px',
                fontSize: '1rem', fontWeight: '800', letterSpacing: '0.5px',
                cursor: isSoldOut ? 'not-allowed' : 'pointer',
                boxShadow: isSoldOut ? 'none' : '0 4px 16px rgba(229,57,53,0.4)',
                opacity: isSoldOut ? 0.7 : 1,
                transition: 'transform 0.1s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
              onMouseDown={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(1)'; }}
              onTouchStart={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onTouchEnd={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <span style={{ fontSize: '1.1rem' }}>🛒</span>
              {isSoldOut ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Image Viewer ── */}
      {fullscreenImage && (
        <FullscreenViewer
          src={fullscreenImage}
          alt={product.name}
          onClose={() => setFullscreenImage(null)}
        />
      )}

      {/* ── Estilos ── */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          0% { opacity: 0; transform: translateY(100px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fsIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </>
  );
}
