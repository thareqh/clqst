import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { SectionHeader } from '../ui/SectionHeader';

const integrations = [
  { name: 'Slack', logo: '/logos/slack.svg' },
  { name: 'GitHub', logo: '/logos/github.svg' },
  { name: 'Jira', logo: '/logos/jira.svg' },
  { name: 'Notion', logo: '/logos/notion.svg' },
  { name: 'Figma', logo: '/logos/figma.svg' },
  { name: 'Google', logo: '/logos/google.svg' },
];

export function Integrations() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <SectionHeader 
          title="Integrations" 
          subtitle="Connect with → Tools" 
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mt-12">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg" />
              <span className="text-sm text-gray-600">{integration.name}</span>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}