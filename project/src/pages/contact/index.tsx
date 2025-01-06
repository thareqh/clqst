import { PageLayout } from '../../components/layout/PageLayout';
import { ContactHero } from '../../components/contact/ContactHero';
import { ContactForm } from '../../components/contact/ContactForm';
import { ContactInfo } from '../../components/contact/ContactInfo';

export default function ContactPage() {
  return (
    <PageLayout>
      <ContactHero />
      <ContactForm />
      <ContactInfo />
    </PageLayout>
  );
}