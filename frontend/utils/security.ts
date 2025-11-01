/**
 * Security utility functions for the AI Mail Merge Assistant
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param text - The text to escape
 * @returns Escaped text safe for HTML rendering
 */
export const escapeHtml = (text: string): string => {
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes CSV field to prevent CSV injection attacks
 * @param field - Field value to sanitize
 * @returns Sanitized field value
 */
export const sanitizeCsvField = (field: string): string => {
  // Remove leading special characters that could trigger CSV injection
  const dangerous = /^[=+\-@]/;
  if (dangerous.test(field)) {
    return `'${field}`;
  }
  return field;
};

/**
 * Validates that a URL uses HTTPS protocol
 * @param url - URL to validate
 * @returns true if URL uses HTTPS
 */
export const isSecureUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Escapes CSV field for safe CSV generation
 * Handles quotes, commas, and newlines
 * @param field - Field value to escape
 * @returns Escaped CSV field
 */
export const escapeCsvField = (field: string): string => {
  const sanitized = sanitizeCsvField(field);

  if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
};
