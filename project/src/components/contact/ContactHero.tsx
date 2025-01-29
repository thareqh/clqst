import { Container } from '../layout/Container';
import { GradientText } from '../ui/GradientText';
import { motion } from 'framer-motion';
import { ChatCircleText } from '@phosphor-icons/react';

export function ContactHero() {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] bg-[size:32px_32px]" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white via-white/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white via-white/50 to-transparent" />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-zinc-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-zinc-100/50 rounded-full blur-3xl" />
      </div>

      <Container className="relative">
        <div className="max-w-3xl mx-auto text-center">
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
                <ChatCircleText weight="duotone" className="w-10 h-10 text-zinc-600" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-semibold text-zinc-900 mb-6">
              Let's <GradientText>Connect</GradientText>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600">
              Have a question about partnerships, investment opportunities, or just want to say hello?
              We'd love to hear from you and explore how we can collaborate together.
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}