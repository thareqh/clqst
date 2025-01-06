import { PageLayout } from '../../components/layout/PageLayout';
import { AccessHero } from '../../components/access/AccessHero';
import { AccessOptions } from '../../components/access/AccessOptions';

export default function AccessPage() {
  return (
    <PageLayout>
      <AccessHero />
      <AccessOptions />
    </PageLayout>
  );
}