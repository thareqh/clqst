import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { 
  Lightbulb, 
  UsersThree, 
  Star, 
  Globe,
  Rocket,
  Heart 
} from "@phosphor-icons/react";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We're constantly pushing boundaries in how teams can work together. Our platform evolves with the latest technology to make collaboration more intuitive and efficient.",
    gradient: 'from-zinc-200 to-zinc-400'
  },
  {
    icon: UsersThree,
    title: "Community Driven",
    description: "Every feature and improvement comes from our users' needs. We believe in the power of collective wisdom and the strength of a supportive community.",
    gradient: 'from-zinc-300 to-zinc-500'
  },
  {
    icon: Star,
    title: "Quality Focused",
    description: "Excellence is in our DNA. From user experience to platform stability, we maintain the highest standards to ensure your creative process is never interrupted.",
    gradient: 'from-zinc-400 to-zinc-600'
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "We're breaking down geographical barriers to enable worldwide collaboration. Great ideas can come from anywhere, and we make sure they can be realized anywhere.",
    gradient: 'from-zinc-300 to-zinc-500'
  },
  {
    icon: Rocket,
    title: "Empowering Growth",
    description: "We provide the tools and environment for both projects and people to reach their full potential. Your success is our success.",
    gradient: 'from-zinc-200 to-zinc-400'
  },
  {
    icon: Heart,
    title: "User-Centric",
    description: "Every decision we make starts with you. We're committed to creating an environment where creativity thrives and ideas flourish.",
    gradient: 'from-zinc-300 to-zinc-500'
  }
];

function ValueCard({ value, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative group"
    >
      <div className="relative p-8 bg-gradient-to-b from-white to-zinc-50/50 backdrop-blur-xl rounded-2xl transition-all duration-300 border border-zinc-200/50 hover:border-zinc-300/50 shadow-lg shadow-zinc-100/50 h-full">
        {/* Icon Container */}
        <div className="relative mb-6">
          {/* Background Circle with Gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-zinc-100/50 blur-xl transform -rotate-6 scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300" />
          
          {/* Icon Background */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-zinc-50 border border-zinc-100 shadow-md flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Glowing Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
            
            {/* Icon */}
            <value.icon 
              className="relative w-7 h-7 text-zinc-800 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" 
              weight="duotone"
            />
          </div>

          {/* Connection Line */}
          {index < values.length - 1 && (index + 1) % 3 !== 0 && (
            <div className="absolute hidden lg:block h-px w-24 bg-gradient-to-r from-zinc-200 to-transparent right-0 top-1/2 translate-x-full" />
          )}
        </div>

        {/* Content */}
        <div className="relative space-y-3">
          <h3 className="text-xl font-medium text-zinc-900 group-hover:text-black transition-colors duration-200">
            {value.title}
          </h3>
          <p className="text-sm text-zinc-600 group-hover:text-zinc-700 leading-relaxed">
            {value.description}
          </p>
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

export function AboutValues() {
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
          {/* Top Left Orb */}
          <motion.div
            className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(244,244,245,0.8) 0%, rgba(244,244,245,0) 70%)',
              filter: 'blur(80px)'
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, -50, 0],
              y: [0, 50, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />

          {/* Bottom Right Orb */}
          <motion.div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(244,244,245,0.8) 0%, rgba(244,244,245,0) 70%)',
              filter: 'blur(60px)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, 30, 0],
              y: [0, -30, 0]
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
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold mb-6 text-zinc-900 tracking-tight"
          >
            Our Core Values
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-zinc-600 max-w-3xl mx-auto"
          >
            These principles guide everything we do as we work to create the best platform for creative collaboration
          </motion.p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {values.map((value, index) => (
            <ValueCard key={value.title} value={value} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}