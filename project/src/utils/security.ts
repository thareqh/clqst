// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 50; // Maximum requests per window

interface RateLimitStore {
  timestamp: number;
  count: number;
}

const rateLimitStore: Map<string, RateLimitStore> = new Map();

// Rate limiting function
export const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit) {
    rateLimitStore.set(userId, { timestamp: now, count: 1 });
    return true;
  }

  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(userId, { timestamp: now, count: 1 });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return false;
  }

  userLimit.count += 1;
  return true;
};

// Input validation
export const validateMessage = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  if (content.length > 1000) return false; // Maximum message length
  if (content.trim().length === 0) return false;
  return true;
};

export const validateAttachment = (file: File): boolean => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

  if (!file) return false;
  if (file.size > MAX_FILE_SIZE) return false;
  if (!ALLOWED_TYPES.includes(file.type)) return false;
  return true;
};

export const sanitizeHTML = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Security headers
export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "img-src 'self' https: data:; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' https://apis.google.com; " +
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}; 