import { motion, useScroll, useTransform } from 'framer-motion';
import { Container } from '../layout/Container';
import { useInView } from 'react-intersection-observer';
import { useRef } from 'react';

const stats = [
  {
    value: '100+',
    label: 'Potential Users',
    description: 'Growing global interest'
  },
  {
    value: '15',
    label: 'Projects Built',
    description: 'On our platform'
  },
  {
    value: '5+',
    label: 'Countries',
    description: 'Global community'
  },
  {
    value: '95%',
    label: 'Satisfaction Rate',
    description: 'From active users'
  }
];

function CountUp({ value }: { value: string }) {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="relative inline-block"
    >
      <span className="relative text-white">
        {value}
      </span>
    </motion.div>
  );
}

export function Stats() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section className="py-24 relative overflow-hidden bg-black">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)
            `,
            backgroundSize: '200% 200%'
          }}
        />
        {/* Animated lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <Container>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative group h-full"
              >
                <div className="relative p-8 rounded-2xl transition-all duration-300 bg-zinc-950/50 backdrop-blur-lg border border-zinc-800/50 hover:border-zinc-700/50 h-full flex flex-col justify-between">
                  {/* Hover effect background */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Glow effect */}
                  <div className="absolute -inset-px bg-gradient-to-r from-zinc-500/5 via-zinc-300/5 to-zinc-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  
                  {/* Content */}
                  <div className="relative space-y-4 flex-1 flex flex-col">
                    {/* Value */}
                    <div className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mb-auto pt-2">
                      <CountUp value={stat.value} />
                    </div>

                    {/* Label and Description Container */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-zinc-300 group-hover:text-white transition-colors duration-200">
                        {stat.label}
                      </h3>
                      <p className="text-sm text-zinc-500 group-hover:text-zinc-400 leading-relaxed">
                        {stat.description}
                      </p>
                    </div>

                    {/* Decorative line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-transparent rounded-tr-2xl" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-tl from-zinc-500/5 to-transparent rounded-bl-2xl" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}