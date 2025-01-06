import { useScrollRestoration } from '../hooks/useScrollRestoration';

export function ScrollToTop() {
  useScrollRestoration();
  return null;
}