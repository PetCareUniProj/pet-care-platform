import { useTheme } from '@/context/ThemeContext';

export function useThemedStyles() {
  const { isDark, colorScheme } = useTheme();

  return {
    isDark,
    colorScheme,
    
    // Background colors
    bgPrimary: isDark ? 'bg-gray-900' : 'bg-gray-50',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-white',
    bgCard: isDark ? 'bg-gray-800' : 'bg-white',
    bgInput: isDark ? 'bg-gray-700' : 'bg-gray-100',
    
    // Text colors
    textPrimary: isDark ? 'text-gray-100' : 'text-gray-800',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-500',
    textMuted: isDark ? 'text-gray-500' : 'text-gray-400',
    
    // Border colors
    borderColor: isDark ? 'border-gray-700' : 'border-gray-100',
    borderColorMedium: isDark ? 'border-gray-600' : 'border-gray-200',
    
    // Icon colors (for MaterialIcons)
    iconColor: isDark ? '#e5e7eb' : '#374151',
    iconColorMuted: isDark ? '#9ca3af' : '#6b7280',
    chevronColor: isDark ? '#6b7280' : '#d1d5db',
    
    // Gradient colors for headers
    gradientColors: {
      orange: isDark ? ['#78350f', '#92400e'] as const : ['#fb923c', '#f59e0b'] as const,
      amber: isDark ? ['#78350f', '#92400e'] as const : ['#f59e0b', '#d97706'] as const,
      violet: isDark ? ['#4c1d95', '#5b21b6'] as const : ['#8b5cf6', '#7c3aed'] as const,
      gray: isDark ? ['#374151', '#1f2937'] as const : ['#6b7280', '#4b5563'] as const,
      green: isDark ? ['#14532d', '#166534'] as const : ['#22c55e', '#16a34a'] as const,
      blue: isDark ? ['#1e3a8a', '#1e40af'] as const : ['#3b82f6', '#2563eb'] as const,
      cyan: isDark ? ['#164e63', '#155e75'] as const : ['#06b6d4', '#0891b2'] as const,
    },
    
    // Modal/overlay
    modalBg: isDark ? 'bg-gray-800' : 'bg-white',
    overlayBg: 'bg-black/50',
    
    // Status colors (remain same for consistency)
    statusColors: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    // Raw colors for non-className usage
    colors: {
      background: isDark ? '#111827' : '#f9fafb',
      card: isDark ? '#1f2937' : '#ffffff',
      text: isDark ? '#f3f4f6' : '#1f2937',
      textSecondary: isDark ? '#9ca3af' : '#6b7280',
      border: isDark ? '#374151' : '#e5e7eb',
      input: isDark ? '#374151' : '#f3f4f6',
    },
  };
}







