import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { SectionHeader } from '../ui/SectionHeader';
import { GradientBlob } from '../ui/GradientBlob';

export function About() {
  return (
    <section className="relative py-24">
      <GradientBlob className="absolute right-0 top-0 w-[500px] h-[500px] opacity-10" />
      <Container>
        <SectionHeader 
          title="About CLIQUEST" 
          subtitle="Our Story → Our Mission" 
        />
        <div className="grid md:grid-cols-2 gap-12 mt-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Revolutionizing Creative Collaboration</h3>
            <p className="text-gray-600">
              CLIQUEST represents a paradigm shift in digital collaboration platforms, introducing an innovative ecosystem where creative minds converge to develop groundbreaking projects.
            </p>
            <p className="text-gray-600">
              Our platform combines the community-driven aspects of social platforms with robust project development tools, creating a unique environment where ideas can flourish through meaningful collaboration.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Our Vision</h3>
            <p className="text-gray-600">
              We envision a future where creative collaboration knows no boundaries, where innovative ideas can find the right team to bring them to life, and where creative projects can flourish through effective collaboration and community support.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium mb-2">Innovation First</h4>
                <p className="text-sm text-gray-600">Encouraging creative thinking and novel approaches</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium mb-2">Community Driven</h4>
                <p className="text-sm text-gray-600">Building inclusive spaces for collaboration</p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}