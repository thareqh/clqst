import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { 
  Lightbulb,
  UsersThree,
  ChatCircleText,
  SquaresFour,
  Books,
  Globe
} from "@phosphor-icons/react";

const features = [
  {
    title: 'Idea Showcase',
    description: 'Share your innovative ideas with a supportive community and get valuable feedback to refine your vision',
    Icon: Lightbulb,
    gradient: 'from-zinc-200 to-zinc-400'
  },
  {
    title: 'Smart Team Building',
    description: 'Find the perfect collaborators based on skills, interests, and experience—no more struggling to build the right team',
    Icon: UsersThree,
    gradient: 'from-zinc-300 to-zinc-500'
  },
  {
    title: 'Unified Communication',
    description: 'Streamline collaboration with integrated chat, task management, and file sharing—all in one centralized workspace',
    Icon: ChatCircleText,
    gradient: 'from-zinc-400 to-zinc-600'
  },
  {
    title: 'Project Hub',
    description: 'Access all your project tools, resources, and team collaboration features in a single, intuitive digital sandbox',
    Icon: SquaresFour,
    gradient: 'from-zinc-500 to-zinc-700'
  },
  {
    title: 'Resource Center',
    description: 'Get access to essential tools, templates, and learning resources to help turn your ideas into successful projects',
    Icon: Books,
    gradient: 'from-zinc-400 to-zinc-600'
  },
  {
    title: 'Global Community',
    description: 'Connect with innovators worldwide, enabling cross-cultural collaboration and diverse perspectives on projects',
    Icon: Globe,
    gradient: 'from-zinc-300 to-zinc-500'
  }
];

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative group"
    >
      <div className="relative p-8 bg-gradient-to-b from-white to-zinc-50/50 backdrop-blur-xl rounded-2xl transition-all duration-300 border border-zinc-200/50 hover:border-zinc-300/50 shadow-lg shadow-zinc-100/50 h-[280px]">
        {/* Icon Container */}
        <div className="relative mb-6">
          {/* Background Circle with Gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-zinc-100/50 blur-xl transform -rotate-6 scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300" />
          
          {/* Icon Background */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-zinc-50 border border-zinc-100 shadow-md flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Glowing Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
            
            {/* Phosphor Icon */}
            <feature.Icon 
              className="relative w-7 h-7 text-zinc-800 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" 
              weight="duotone"
            />
          </div>

          {/* Connection Line */}
          {index < 5 && (
            <div className="absolute hidden md:block h-px w-24 bg-gradient-to-r from-zinc-200 to-transparent right-0 top-1/2 translate-x-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-3 text-zinc-900 group-hover:text-black transition-colors duration-200">
            {feature.title}
          </h3>
          <p className="text-sm text-zinc-600 group-hover:text-zinc-700 leading-relaxed">
            {feature.description}
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

export function Features() {
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
        <motion.div 
          className="text-center mb-24"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold mb-6 text-zinc-900 tracking-tight"
          >
            Everything You Need to Succeed
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-600 text-lg max-w-2xl mx-auto"
          >
            From ideation to execution, our platform provides all the tools and resources you need to turn your vision into reality
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              feature={feature} 
              index={index} 
            />
          ))}
        </div>
      </Container>
    </section>
  );
}