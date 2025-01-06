import { Container } from '../layout/Container';
import { AccessCard } from './AccessCard';
import { SITE_VERSION } from '../../config/siteConfig';

export function AccessOptions() {
  return (
    <section className="py-24">
      <Container>
        <div className={`grid ${SITE_VERSION === 'full' ? 'md:grid-cols-2' : ''} gap-8 max-w-4xl mx-auto`}>
          <AccessCard
            title="Web App"
            description="Access Cliquest directly in your browser. Perfect for desktop and laptop users."
            icon="🌐"
            buttonText="Launch Web Version"
            href="https://app.cliquest.com"
            requiresAuth={true}
          />
          
          {SITE_VERSION === 'full' && (
            <AccessCard
              title="Android App"
              description="Download our native Android app for the best mobile experience."
              icon="📱"
              buttonText="Get it on Google Play"
              href="https://play.google.com/store/apps/details?id=com.cliquest.me"
              requiresAuth={false}
            />
          )}
        </div>
      </Container>
    </section>
  );
}