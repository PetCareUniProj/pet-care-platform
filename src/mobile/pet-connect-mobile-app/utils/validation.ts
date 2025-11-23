// Validation utilities

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const validators = {
  email: (value: string): boolean => {
    return emailRegex.test(value);
  },

  phone: (value: string): boolean => {
    return phoneRegex.test(value);
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


