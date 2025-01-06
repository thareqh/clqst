import { PageLayout } from '../../components/layout/PageLayout';
import { Container } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { GradientText } from '../../components/ui/GradientText';
import { motion } from 'framer-motion';

export default function CareersPage() {
  return (
    <PageLayout>
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <PageHeader
            title="Join Our Journey"
            subtitle="Help us revolutionize creative collaboration and build something amazing together."
            gradient
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-8"
          >
            <Card className="p-8 text-left">
              <h2 className="text-2xl mb-4">
                <GradientText>Build With Us</GradientText>
              </h2>
              <p className="text-gray-600 mb-6">
                We're looking for passionate individuals who want to make a difference in how teams collaborate. 
                If you're excited about creating innovative solutions and being part of a growing startup, we'd love to chat.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  variant="primary" 
                  href="/contact"
                  className="w-full"
                >
                  Get in Touch
                </Button>
                <Button 
                  variant="outline" 
                  href="/about"
                  className="w-full"
                >
                  Learn More
                </Button>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-left">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="font-medium mb-2">Early Stage</h3>
                <p className="text-sm text-gray-600">Join early and help shape our product and culture from the ground up.</p>
              </Card>

              <Card className="p-6 text-left">
                <div className="text-3xl mb-4">💪</div>
                <h3 className="font-medium mb-2">High Impact</h3>
                <p className="text-sm text-gray-600">Make meaningful contributions that directly affect our success.</p>
              </Card>

              <Card className="p-6 text-left">
                <div className="text-3xl mb-4">🌍</div>
                <h3 className="font-medium mb-2">Remote First</h3>
                <p className="text-sm text-gray-600">Work from anywhere and help build a global product.</p>
              </Card>
            </div>
          </motion.div>
        </div>
      </Container>
    </PageLayout>
  );
}