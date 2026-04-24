import { createTheme } from '@mantine/core';

export const theme = createTheme({
  colors: {
    brand: [
      '#FFF5F0',
      '#FFE8DE',
      '#FFD0BC',
      '#FFB399',
      '#FF8F66',
      '#F56A1C',
      '#E55A0F',
      '#CC4F0D',
      '#A33F0A',
      '#7A2F08',
    ],
    gray: [
      '#F8F9FA',
      '#F1F3F5',
      '#E9ECEF',
      '#DEE2E6',
      '#CED4DA',
      '#ADB5BD',
      '#868E96',
      '#495057',
      '#343A40',
      '#212529',
    ],
  },
  primaryColor: 'brand',
  primaryShade: { light: 5, dark: 6 },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.03)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.05)',
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '700',
  },
});
