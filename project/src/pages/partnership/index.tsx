import { PageLayout } from '../../components/layout/PageLayout';
import { Container } from '../../components/layout/Container';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { GradientText } from '../../components/ui/GradientText';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Users, 
  Lightbulb, 
  Handshake, 
  ChartLineUp, 
  Buildings,
  Coins,
  ShieldCheck,
  Target,
  ArrowRight
} from '@phosphor-icons/react';

export default function PartnershipPage() {
  return (
    <PageLayout>
      <section className="py-24 relative overflow-hidden bg-white">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] bg-[size:32px_32px]" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white via-white/50 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white via-white/50 to-transparent" />
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-zinc-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-zinc-100/50 rounded-full blur-3xl" />
        </div>

        <Container className="relative">
          {/* Hero Section with Enhanced Visual */}
          <div className="max-w-5xl mx-auto text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-zinc-100 rounded-3xl rotate-12 -z-10 blur-lg" />
              <motion.div
                initial={{ rotate: 45 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-8"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl flex items-center justify-center shadow-xl">
                  <Handshake weight="duotone" className="w-10 h-10 text-zinc-600" />
                </div>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-semibold text-zinc-900 mb-6">
                Partner & Invest in <GradientText>Cliquest</GradientText>
              </h1>
              <p className="text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto">
                Join us in revolutionizing creative collaboration. Whether you're looking to form strategic partnerships or invest in our platform's growth, 
                Cliquest offers compelling opportunities to be part of the future of digital creativity.
              </p>
            </motion.div>

            {/* Partnership Options with Enhanced Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-32">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="group h-full p-8 text-left bg-gradient-to-b from-white to-zinc-50/50 border border-zinc-200/50 hover:border-zinc-300 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Handshake weight="duotone" className="w-8 h-8 text-zinc-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-zinc-900 mb-4">Strategic Partnership</h2>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 group/item">
                      <Buildings className="w-5 h-5 mt-1 text-zinc-600 group-hover/item:text-zinc-900 transition-colors" />
                      <span className="text-zinc-600 group-hover/item:text-zinc-900 transition-colors">Technology integration and API access opportunities</span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <Users className="w-5 h-5 mt-1 text-zinc-600 group-hover/item:text-zinc-900 transition-colors" />
                      <span className="text-zinc-600 group-hover/item:text-zinc-900 transition-colors">Access to our growing creator ecosystem</span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <Target className="w-5 h-5 mt-1 text-zinc-600 group-hover/item:text-zinc-900 transition-colors" />
                      <span className="text-zinc-600 group-hover/item:text-zinc-900 transition-colors">Co-marketing and growth collaboration</span>
                    </li>
                  </ul>
                <Button 
                  variant="outline" 
                    href="/contact" 
                    className="w-full group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300"
                >
                    <span>Become a Partner</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="group h-full p-8 text-left bg-gradient-to-b from-white to-zinc-50/50 border border-zinc-200/50 hover:border-zinc-300 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Coins weight="duotone" className="w-8 h-8 text-zinc-600" />
                    </div>
                  <h2 className="text-2xl font-semibold text-zinc-900 mb-4">Investment Opportunity</h2>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 group/item">
                      <ChartLineUp className="w-5 h-5 mt-1 text-zinc-600 group-hover/item:text-zinc-900 transition-colors" />
                      <span className="text-zinc-600 group-hover/item:text-zinc-900 transition-colors">Early-stage investment in Cliquest's platform growth</span>
                  </li>
                    <li className="flex items-start gap-3 group/item">
                      <Rocket className="w-5 h-5 mt-1 text-zinc-600 group-hover/item:text-zinc-900 transition-colors" />
                      <span className="text-zinc-600 group-hover/item:text-zinc-900 transition-colors">Be part of the next generation creative platform</span>
                  </li>
                    <li className="flex items-start gap-3 group/item">
                      <ShieldCheck className="w-5 h-5 mt-1 text-zinc-600 group-hover/item:text-zinc-900 transition-colors" />
                      <span className="text-zinc-600 group-hover/item:text-zinc-900 transition-colors">Transparent growth metrics and milestone updates</span>
                  </li>
                </ul>
                  <Button 
                    variant="primary" 
                    href="/contact" 
                    className="w-full group-hover:bg-zinc-900 transition-all duration-300"
                  >
                    <span>Explore Investment</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
              </Card>
              </motion.div>
            </div>

            {/* Enhanced Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-32"
            >
              <h2 className="text-3xl font-semibold text-zinc-900 mb-16">Why Invest in Cliquest</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  <Card className="group p-8 text-left bg-gradient-to-b from-white to-zinc-50/50 border border-zinc-200/50 hover:border-zinc-300 transition-all duration-300">
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Rocket weight="duotone" className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-zinc-900">Rapid Growth</h3>
                    <p className="text-zinc-600 leading-relaxed">Join us at an early stage as we expand our platform and user base globally.</p>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  <Card className="group p-8 text-left bg-gradient-to-b from-white to-zinc-50/50 border border-zinc-200/50 hover:border-zinc-300 transition-all duration-300">
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Users weight="duotone" className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-zinc-900">Market Potential</h3>
                    <p className="text-zinc-600 leading-relaxed">Tap into the growing creative collaboration and digital workspace market.</p>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  <Card className="group p-8 text-left bg-gradient-to-b from-white to-zinc-50/50 border border-zinc-200/50 hover:border-zinc-300 transition-all duration-300">
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Lightbulb weight="duotone" className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-zinc-900">Innovation Leader</h3>
                    <p className="text-zinc-600 leading-relaxed">Support the future of creative collaboration technology.</p>
              </Card>
                </motion.div>
            </div>
            </motion.div>

            {/* Enhanced CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="group p-12 md:p-16 text-center bg-gradient-to-br from-white to-zinc-50/50 border border-zinc-200/50 hover:border-zinc-300 transition-all duration-300">
                <motion.div
                  initial={{ scale: 0.95 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <div className="w-20 h-20 mx-auto bg-zinc-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ChartLineUp weight="duotone" className="w-10 h-10 text-zinc-600" />
                </div>
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 mb-6">
                  Be Part of Our Growth Story
                </h2>
                <p className="text-lg text-zinc-600 mb-12 max-w-2xl mx-auto">
                  Whether you're interested in strategic partnerships or investment opportunities in Cliquest's platform,
                  we're excited to discuss how we can grow together.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Button 
                    variant="primary" 
                    href="/contact" 
                    className="md:w-auto px-8 py-4 text-lg group-hover:bg-zinc-900 transition-all duration-300"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    href="/about" 
                    className="md:w-auto px-8 py-4 text-lg group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </div>
              </Card>
          </motion.div>
        </div>
      </Container>
      </section>
    </PageLayout>
  );
}