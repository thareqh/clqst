import { motion, useScroll, useTransform } from 'framer-motion';
import { Container } from './layout/Container';
import { GradientText } from './ui/GradientText';
import { AuthButton } from './ui/AuthButton';
import { useRef } from 'react';
import { HeroBackground } from './hero/HeroBackground';
import { Button } from './ui/Button';
import { UsersThree, ArrowRight } from '@phosphor-icons/react';

const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export function Hero() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center -mt-16 overflow-hidden">
      <HeroBackground />
      
      <Container className="relative">
        <motion.div 
          ref={containerRef}
          className="max-w-5xl mx-auto text-center px-4 md:px-6"
          style={{ y, opacity }}
        >
          <motion.div
            variants={fadeInUpAnimation}
            initial="initial"
            animate="animate"
            className="inline-block mb-8"
          >
            <motion.div 
              className="relative px-4 py-1.5"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-primary-500/10 to-primary-500/5 rounded-full blur-md" />
              <div className="relative bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border-2 border-primary-200/80">
                <span className="text-sm font-medium text-primary-600 inline-flex items-center gap-2">
                  <motion.span 
                    className="opacity-80"
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    💡
                  </motion.span>
                  The Ultimate Creative Collaboration Platform
                </span>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUpAnimation}
            initial="initial"
            animate="animate"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-10"
          >
            <div className="mb-3">Bring Your Ideas</div>
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <GradientText>To Life</GradientText>
            </motion.span>
          </motion.h1>
          
          <motion.p
            variants={fadeInUpAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto px-4"
          >
            A community-driven platform where innovators, creators, and developers come together to transform ideas into reality. Say goodbye to scattered tools and hello to seamless collaboration in one digital workspace.
          </motion.p>
          
          <motion.div
            variants={fadeInUpAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <Button
              variant="primary"
              className="text-sm md:text-base group relative overflow-hidden"
              href="/auth#signup"
            >
              <motion.div 
                className="relative z-10 flex items-center gap-2"
                whileHover={{ x: [0, 4, 0] }}
                transition={{ duration: 0.3 }}
              >
                <UsersThree weight="duotone" className="w-5 h-5" />
                Join Our Creative Community
                <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}