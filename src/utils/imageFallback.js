export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

export const handleImageError = (e, fallback = DEFAULT_FALLBACK_IMAGE) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
};
