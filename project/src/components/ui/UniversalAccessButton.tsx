import { Button } from './Button';
import { SITE_VERSION, siteConfig } from '../../config/siteConfig';

export function UniversalAccessButton() {
  const config = siteConfig[SITE_VERSION];
  
  return (
    <Button 
      variant="primary"
      href={config.accessButton.href}
      className="flex items-center gap-2"
    >
      {config.accessButton.text} →
    </Button>
  );
}