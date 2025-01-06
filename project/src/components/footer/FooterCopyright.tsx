import { FooterLink } from './FooterLink';

export function FooterCopyright() {
  return (
    <div className="pt-8 mt-12 border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-600">
          © {new Date().getFullYear()} Cliquest. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <FooterLink href="/privacy">Privacy</FooterLink>
          <FooterLink href="/terms">Terms</FooterLink>
        </div>
      </div>
    </div>
  );
}