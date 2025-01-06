const SITE_VERSION = import.meta.env.VITE_SITE_VERSION as 'web-only' | 'full';

if (!SITE_VERSION) {
  console.warn('VITE_SITE_VERSION not set, defaulting to web-only');
}

export const siteConfig = {
  'web-only': {
    name: 'Cliquest Web',
    accessButton: {
      text: 'Launch Web App',
      href: 'https://app.cliquest.com'
    },
    ctaText: 'Start Using Cliquest Today',
    description: 'Experience seamless project collaboration through our web platform'
  },
  'full': {
    name: 'Cliquest',
    accessButton: {
      text: 'Get it on Play Store',
      href: 'https://play.google.com/store/apps/details?id=com.cliquest.me'
    },
    ctaText: 'Download Cliquest',
    description: 'Experience seamless project collaboration across web and mobile'
  }
} as const;

export { SITE_VERSION };