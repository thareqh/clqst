import { PageLayout } from '../../components/layout/PageLayout';
import { AboutHero } from '../../components/about/AboutHero';
import { AboutMission } from '../../components/about/AboutMission';
import { AboutValues } from '../../components/about/AboutValues';
import { AboutTeam } from '../../components/about/AboutTeam';
import { AboutTimeline } from '../../components/about/AboutTimeline';

export default function AboutPage() {
  return (
    <PageLayout>
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutTeam />
      <AboutTimeline />
    </PageLayout>
  );
}