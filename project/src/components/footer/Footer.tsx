import { Container } from '../layout/Container';
import { Logo } from '../Logo';
import { FooterColumn } from './FooterColumn';
import { FooterLink } from './FooterLink';
import { FooterSocial } from './FooterSocial';
import { FooterCopyright } from './FooterCopyright';

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Pricing', href: '#pricing' }
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' }
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-6 space-y-6">
              <Logo />
              <p className="text-sm sm:text-base text-gray-600 max-w-md">
                Cliquest represents a paradigm shift in digital collaboration platforms, introducing an innovative ecosystem where creative minds converge to develop groundbreaking projects.
              </p>
              <FooterSocial />
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-8">
                <FooterColumn title="Product">
                  {productLinks.map((link) => (
                    <FooterLink key={link.label} href={link.href}>
                      {link.label}
                    </FooterLink>
                  ))}
                </FooterColumn>

                <FooterColumn title="Company">
                  {companyLinks.map((link) => (
                    <FooterLink key={link.label} href={link.href}>
                      {link.label}
                    </FooterLink>
                  ))}
                </FooterColumn>
              </div>
            </div>
          </div>

          <FooterCopyright />
        </div>
      </Container>
    </footer>
  );
}