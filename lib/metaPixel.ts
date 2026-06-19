import { Product } from '../context/CartContext';

declare global {
  interface Window {
    fbq: any;
  }
}

export const generateEventId = () => {
  return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 11);
};

export const trackViewContent = (product: Product) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const eventId = generateEventId();
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      value: product.price,
      currency: 'MXN'
    }, { eventID: eventId });

    if (product.colorHex) {
      window.fbq('trackCustom', 'LipstickShadeViewed', {
        content_name: product.name,
        color: product.colorHex,
        family: product.family,
      }, { eventID: eventId });
    }
  }
};

export const trackAddToCart = (product: Product) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const eventId = generateEventId();
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      value: product.price,
      currency: 'MXN'
    }, { eventID: eventId });

    if (product.colorHex) {
      window.fbq('trackCustom', 'LipstickShadeAdded', {
        content_name: product.name,
        color: product.colorHex,
        family: product.family,
      }, { eventID: eventId });
    }
  }
};

export const trackInitiateCheckout = (items: { id: string }[], total: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const eventId = generateEventId();
    window.fbq('track', 'InitiateCheckout', {
      num_items: items.length,
      value: total,
      currency: 'MXN'
    }, { eventID: eventId });
  }
};

export const trackPurchase = (total: number, items: { id: string }[]) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const eventId = generateEventId();
    window.fbq('track', 'Purchase', {
      content_type: 'product',
      content_ids: items.map(i => i.id),
      value: total,
      currency: 'MXN'
    }, { eventID: eventId });
  }
};
