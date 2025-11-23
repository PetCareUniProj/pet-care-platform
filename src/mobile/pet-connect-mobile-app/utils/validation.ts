// Validation utilities

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Ukrainian phone formats:
// +380 XX XXX XX XX (13 chars)
// 380 XX XXX XX XX (12 chars)
// 0XX XXX XX XX (10 chars)
export const phoneRegex = /^(\+?380|0)?\d{9}$/;

export const validators = {
  email: (value: string): boolean => {
    return emailRegex.test(value);
  },

  phone: (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      return false;
    }
    
    // Remove all spaces, dashes, and parentheses, keep only digits and +
    const cleaned = value.replace(/[\s\-()]/g, '');
    
    // Extract only digits for length check
    const digitsOnly = cleaned.replace(/\D/g, '');
    
    // Ukrainian phone numbers must have at least 10 digits (0XX XXX XX XX format)
    // or 12 digits (380 XX XXX XX XX) or 13 with + (+380 XX XXX XX XX)
    if (digitsOnly.length < 10) {
      return false;
    }
    
    // Check specific formats
    if (cleaned.startsWith('+380')) {
      // +380 format: must be exactly 13 characters (+380 + 9 digits)
      return cleaned.length === 13 && /^\+380\d{9}$/.test(cleaned);
    } else if (cleaned.startsWith('380')) {
      // 380 format: must be exactly 12 characters (380 + 9 digits)
      return cleaned.length === 12 && /^380\d{9}$/.test(cleaned);
    } else if (cleaned.startsWith('0')) {
      // 0XX format: must be exactly 10 characters (0 + 9 digits)
      return cleaned.length === 10 && /^0\d{9}$/.test(cleaned);
    }
    
    // If doesn't match standard formats, but has 10-13 digits, accept it
    // (user might be typing and we don't want to block them mid-typing)
    return digitsOnly.length >= 10 && digitsOnly.length <= 13;
  },

  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  password: (value: string): boolean => {
    // At least 8 characters, one uppercase, one lowercase, one number
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  date: (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  number: (value: any): boolean => {
    return !isNaN(Number(value));
  },

  positiveNumber: (value: number): boolean => {
    return value > 0;
  },
};

export const getValidationError = (field: string, value: any, rules: any): string | null => {
  if (rules.required && !validators.required(value)) {
    return `${field} is required`;
  }

  if (rules.email && !validators.email(value)) {
    return `${field} must be a valid email`;
  }

  if (rules.phone && !validators.phone(value)) {
    return `${field} must be a valid phone number`;
  }

  if (rules.minLength && !validators.minLength(value, rules.minLength)) {
    return `${field} must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && !validators.maxLength(value, rules.maxLength)) {
    return `${field} must be at most ${rules.maxLength} characters`;
  }

  if (rules.password && !validators.password(value)) {
    return 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  return null;
};


