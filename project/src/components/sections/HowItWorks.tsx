import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { 
  NotePencil,
  UsersThree,
  ChartLineUp,
  RocketLaunch
} from "@phosphor-icons/react";

const steps = [
  {
    number: '01',
    title: 'Share Your Vision',
    description: 'Post your innovative ideas and get valuable feedback from our global community of creators',
    Icon: NotePencil,
    gradient: 'from-zinc-200 to-zinc-400'
  },
  {
    number: '02',
    title: 'Build Your Dream Team',
    description: 'Connect with skilled collaborators who share your passion and complement your expertise',
    Icon: UsersThree,
    gradient: 'from-zinc-300 to-zinc-500'
  },
  {
    number: '03',
    title: 'Collaborate Seamlessly',
    description: 'Use our integrated tools for chat, storage, and task management to work efficiently together',
    Icon: ChartLineUp,
    gradient: 'from-zinc-400 to-zinc-600'
  },
  {
    number: '04',
    title: 'Make It Reality',
    description: 'Transform your ideas into successful projects with our supportive ecosystem',
    Icon: RocketLaunch,
    gradient: 'from-zinc-500 to-zinc-700'
  }
];

function StepCard({ step, index }: { step: typeof steps[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative group h-[400px]"
    >
      <div className="absolute inset-0">
        <div className="relative p-8 bg-white rounded-2xl transition-all duration-300 border border-zinc-200 hover:border-zinc-300 h-full flex flex-col">
          {/* Icon Container */}
          <div className="relative h-[80px]">
            {/* Background Circle with Gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 blur-xl transform -rotate-6 scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            
            {/* Icon Background */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-zinc-100 border border-zinc-200 shadow-sm flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Glowing Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Phosphor Icon */}
              <step.Icon 
                className="relative w-8 h-8 text-zinc-700 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" 
                weight="duotone"
              />
            </div>

            {/* Decorative Dots */}
            <div className="absolute -right-2 -top-2 w-6 h-6 grid grid-cols-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-1 h-1 rounded-full bg-zinc-300" />
              <div className="w-1 h-1 rounded-full bg-zinc-200" />
              <div className="w-1 h-1 rounded-full bg-zinc-200" />
              <div className="w-1 h-1 rounded-full bg-zinc-300" />
            </div>
          </div>

          {/* Number */}
          <div className="flex items-center space-x-4 h-[60px]">
            <div className={`text-4xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
              {step.number}
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-300 to-transparent" />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between h-[180px] py-4">
            <h3 className="text-xl font-medium text-zinc-800 group-hover:text-zinc-900 transition-colors duration-200">
              {step.title}
            </h3>
            <p className="text-sm text-zinc-600 group-hover:text-zinc-700 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Hover Effects */}
          <div className="absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-100 to-transparent rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-zinc-100 to-transparent rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-zinc-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] bg-[size:48px_48px] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:60px_60px]" />
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
            Your Journey to Success
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-600 text-lg max-w-2xl mx-auto"
          >
            From idea to reality in four simple steps
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <StepCard 
              key={step.number} 
              step={step} 
              index={index} 
            />
          ))}
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-zinc-100 to-transparent rounded-full blur-3xl opacity-60 transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-zinc-100 to-transparent rounded-full blur-3xl opacity-60 transform -translate-x-1/3 translate-y-1/3" />
      </Container>
    </section>
  );
} 