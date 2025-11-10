import DOMPurify from 'dompurify';
import { createLogger } from './logger';

const logger = createLogger('Sanitization');

function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

type PurifyConfig = {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  FORCE_BODY?: boolean;
  [key: string]: unknown;
};

const STRICT_CONFIG: PurifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: true,
};

const LENIENT_CONFIG: PurifyConfig = {
  ALLOWED_TAGS: [
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'br',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'code',
    'pre',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeHtml(
  dirty: string,
  config: PurifyConfig = STRICT_CONFIG,
): string {
  if (!isBrowser()) {
    logger.warn('sanitizeHtml called on server-side - returning empty string');
    return '';
  }

  try {
    const raw = DOMPurify.sanitize(dirty, config) as unknown;
    const clean = typeof raw === 'string' ? raw : String(raw);
    if (clean !== dirty) {
      logger.debug('HTML was sanitized', {
        originalLength: dirty.length,
        cleanLength: clean.length,
      });
    }
    return clean;
  } catch (error) {
    logger.error('Failed to sanitize HTML', error);
    return '';
  }
}

export function sanitizeHtmlLenient(dirty: string): string {
  return sanitizeHtml(dirty, LENIENT_CONFIG);
}

export function stripHtml(html: string): string {
  if (!isBrowser()) {
    return html.replace(/<[^>]*>/g, '');
  }

  return String(DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }));
}

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const trimmed = url.trim();

    if (
      trimmed.toLowerCase().startsWith('javascript:') ||
      trimmed.toLowerCase().startsWith('data:') ||
      trimmed.toLowerCase().startsWith('vbscript:')
    ) {
      logger.warn('Blocked dangerous URL protocol', {
        url: trimmed.substring(0, 50),
      });
      return null;
    }

    const parsed = new URL(trimmed);

    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      logger.warn('Blocked disallowed URL protocol', {
        protocol: parsed.protocol,
      });
      return null;
    }

    return parsed.toString();
  } catch {
    if (url.startsWith('/')) {
      return url;
    }
    logger.warn('Invalid URL format', { url: url.substring(0, 50) });
    return null;
  }
}

export function isUrlSafe(url: string): boolean {
  return sanitizeUrl(url) !== null;
}

export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize a search query
 *
 * @param query - Search query string
 * @returns Sanitized query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return query
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '')
    .replace(/[()[\]{}]/g, '')
    .replace(/\s{2,}/g, ' ')
    .substring(0, 200);
}

export function sanitizeSqlString(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comment start
    .replace(/\*\//g, ''); // Remove multi-line comment end
}

/**
 * Sanitize a file path (prevents path traversal)
 *
 * @param path - File path
 * @returns Sanitized path
 */
export function sanitizeFilePath(path: string): string {
  if (!path || typeof path !== 'string') {
    return '';
  }

  return path
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/^[/\\]/, ''); // Remove leading slashes
}

// ============================================================================
// SPECIALIZED SANITIZATION
// ============================================================================

/**
 * Sanitize an email address
 *
 * @param email - Email address
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const trimmed = email.trim().toLowerCase();

  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitize a phone number (removes non-numeric characters)
 *
 * @param phone - Phone number
 * @returns Sanitized phone number with only digits and +
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Sanitize a slug (URL-safe string)
 *
 * @param slug - Slug string
 * @returns Sanitized slug
 */
export function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    return '';
  }

  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// ============================================================================
// EXPORT CONFIGURATIONS
// ============================================================================

/**
 * Export DOMPurify configurations for direct use
 */
export const sanitizationConfigs = {
  strict: STRICT_CONFIG,
  lenient: LENIENT_CONFIG,
};
