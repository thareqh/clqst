import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Container } from '../layout/Container';
import { 
  ChartLine,
  Users,
  Rocket,
  GlobeHemisphereWest,
  Star
} from "@phosphor-icons/react";
import { useRef } from 'react';

const stats = [
  {
    icon: ChartLine,
    value: "100+",
    label: "Potential Users",
    description: "Growing Interest",
    gradient: 'from-zinc-200 to-zinc-400'
  },
  {
    icon: Rocket,
    value: "15",
    label: "Projects Built",
    description: "And Growing",
    gradient: 'from-zinc-300 to-zinc-500'
  },
  {
    icon: GlobeHemisphereWest,
    value: "5+",
    label: "Countries",
    description: "Global Community",
    gradient: 'from-zinc-400 to-zinc-600'
  },
  {
    icon: Star,
    value: "95%",
    label: "Satisfaction Rate",
    description: "User Happiness",
    gradient: 'from-zinc-300 to-zinc-500'
  }
];

function StatsCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative group"
    >
      <div className="relative p-8 bg-gradient-to-b from-white to-zinc-50/50 backdrop-blur-xl rounded-2xl transition-all duration-300 border border-zinc-200/50 hover:border-zinc-300/50 shadow-lg shadow-zinc-100/50">
        {/* Icon Container */}
        <div className="relative mb-6">
          {/* Background Circle with Gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-zinc-100/50 blur-xl transform -rotate-6 scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300" />
          
          {/* Icon Background */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-zinc-50 border border-zinc-100 shadow-md flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Glowing Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
            
            {/* Icon */}
            <stat.icon 
              className="relative w-7 h-7 text-zinc-800 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" 
              weight="duotone"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <motion.div 
            className="text-3xl font-bold text-zinc-900 group-hover:text-black transition-colors duration-200"
          >
            {stat.value}
          </motion.div>
          <motion.div 
            className="text-sm font-medium text-zinc-800 group-hover:text-zinc-900"
          >
            {stat.label}
          </motion.div>
          <motion.div 
            className="text-sm text-zinc-600 group-hover:text-zinc-700"
          >
            {stat.description}
          </motion.div>
        </div>

        {/* Hover Effects */}
        <div className="absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white to-transparent rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3" />
        </div>
      </div>
    </motion.div>
  );
}

export function AboutMission() {
  return (
    <section className="py-32 relative overflow-hidden bg-white">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        {/* Dots Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:32px_32px] opacity-50" />
        
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Top Right Orb */}
          <motion.div
            className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(244,244,245,0.8) 0%, rgba(244,244,245,0) 70%)',
              filter: 'blur(80px)'
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, -50, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />

          {/* Bottom Left Orb */}
          <motion.div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(244,244,245,0.8) 0%, rgba(244,244,245,0) 70%)',
              filter: 'blur(60px)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -30, 0],
              y: [0, 30, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
          />
        </motion.div>
      </div>
      
      <Container className="relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Mission Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:pr-8"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-semibold mb-6 text-zinc-900 tracking-tight"
            >
              Transforming Ideas into Reality Through Technology
            </motion.h2>
            
            <motion.div 
              className="space-y-6 text-zinc-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-lg leading-relaxed">
                At Cliquest, we understand the journey from idea to reality can be challenging. That's why we've created a digital ecosystem where creativity thrives and collaboration feels natural. Our platform eliminates the barriers between great ideas and their execution.
              </p>
              <p className="text-lg leading-relaxed">
                We're not just building another project management tool – we're crafting a space where innovators, creators, and developers can find the right partners, access necessary resources, and turn their visions into successful projects.
              </p>
              <p className="text-lg leading-relaxed">
                By combining intuitive tools with a supportive community, we're making it easier than ever for anyone to bring their ideas to life, regardless of their background or experience level.
              </p>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={stat.label} stat={stat} index={index} />
            ))}
          </div>
      </div>
      </Container>
    </section>
  );
}