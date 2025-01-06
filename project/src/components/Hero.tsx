import { motion } from 'framer-motion';
import { Container } from './layout/Container';
import { GridBackground } from './ui/GridBackground';
import { GradientText } from './ui/GradientText';
import { AuthButton } from './ui/AuthButton';

const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export function Hero() {
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 overflow-hidden">
      <GridBackground />
      
      {/* Faded Grid Illustration */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundSize: '30px 30px',
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
          `
        }}
      />
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent opacity-40" />
      </div>
      
      <Container className="relative">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6">
          <motion.div
            variants={fadeInUpAnimation}
            initial="initial"
            animate="animate"
            className="inline-block mb-4"
          >
            <div className="relative px-4 py-1.5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-primary-500/10 to-primary-500/5 rounded-full blur-md" />
              <div className="relative bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-primary-100">
                <span className="text-sm font-medium text-primary-600 inline-flex items-center gap-2">
                  <span className="opacity-80">🎉</span>
                  The Best Collaboration Platform for Creative Teams
                </span>
              </div>
            </div>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUpAnimation}
            initial="initial"
            animate="animate"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal mb-6 md:mb-8 leading-tight"
          >
            Where Ideas <br/>
            <GradientText>Transform</GradientText> into Reality
          </motion.h1>
          
          <motion.p
            variants={fadeInUpAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto px-4"
          >
            Experience seamless project collaboration through our modern platform
          </motion.p>
          
          <motion.div
            variants={fadeInUpAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <AuthButton className="text-sm md:text-base" />
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}