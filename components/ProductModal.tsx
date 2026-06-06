"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCart, Product } from '../context/CartContext';
import AddToCartBar from './product-modal/AddToCartBar';
import FullscreenViewer from './product-modal/FullscreenViewer';
import ProductDetails from './product-modal/ProductDetails';
import ProductGallery from './product-modal/ProductGallery';
import ProductModalAnimations from './product-modal/ProductModalAnimations';
import ProductModalHeader from './product-modal/ProductModalHeader';
import { DEFAULT_DESC, DESCRIPTIONS } from './product-modal/productDescriptions';

interface ProductModalProps {
  product: Product;
  products: Product[];
  onClose: () => void;
  onNavigate: (product: Product) => void;
}

export default function ProductModal({ product, products, onClose, onNavigate }: ProductModalProps) {
  const { items, addItem } = useCart();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [imageGalleryIndex, setImageGalleryIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const historyPushed = useRef(false);
  const closingRef = useRef(false);

  const cartQuantity = items.find(item => item.id === product.id)?.quantity ?? 0;
  const availableQuantity = product.stock !== undefined ? Math.max(0, product.stock - cartQuantity) : undefined;
  const isSoldOut = availableQuantity !== undefined && availableQuantity <= 0;

  const productImages = [product.imageUrl];
  if (product.imageUrlSecondary && product.imageUrlSecondary !== product.imageUrl) {
    productImages.push(product.imageUrlSecondary);
  }

  const description = DESCRIPTIONS[product.name] ?? DEFAULT_DESC;
  const currentIndex = products.findIndex(p => p.id === product.id);

  useEffect(() => {
    setImageGalleryIndex(0);
    setSwipeOffset(0);
  }, [product.id]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleModalTouchStart = useCallback((e: React.TouchEvent) => {
    if (fullscreenImage) return;
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, [fullscreenImage]);

  const handleModalTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || fullscreenImage) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;

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
        setIsTransitioning(true);
        setTimeout(() => {
          onNavigate(products[currentIndex + 1]);
          setIsTransitioning(false);
        }, 150);
      } else if (swipeOffset > 0 && currentIndex > 0) {
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

  return (
    <>
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

      <div
        ref={modalRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
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
          <ProductModalHeader onClose={onClose} />

          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
            <ProductGallery
              productName={product.name}
              productImages={productImages}
              imageGalleryIndex={imageGalleryIndex}
              setImageGalleryIndex={setImageGalleryIndex}
              onOpenFullscreen={setFullscreenImage}
            />
            <ProductDetails
              product={product}
              products={products}
              description={description}
              availableQuantity={availableQuantity}
              currentIndex={currentIndex}
              onNavigate={onNavigate}
            />
          </div>

          <AddToCartBar
            product={product}
            isSoldOut={isSoldOut}
            onAddItem={addItem}
            onClose={onClose}
          />
        </div>
      </div>

      {fullscreenImage && (
        <FullscreenViewer
          src={fullscreenImage}
          alt={product.name}
          onClose={() => setFullscreenImage(null)}
        />
      )}

      <ProductModalAnimations />
    </>
  );
}
