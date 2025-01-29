import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { Calendar, Flag, Rocket, Star, Trophy, Users } from '@phosphor-icons/react';

interface Milestone {
  year: string;
  quarter: string;
  title: string;
  description: string;
  icon: any;
}

const milestones: Milestone[] = [
  {
    year: "2022",
    quarter: "Q4",
    title: "The Initial Spark",
    description: "Cliquest was born from personal experiences of struggling to find project collaborators. We recognized the challenge of connecting with like-minded individuals who share the same vision and passion for creative projects.",
    icon: Calendar
  },
  {
    year: "2023",
    quarter: "Q4",
    title: "Hackathon Achievement",
    description: "Participated in a international hackathon and secured second place. The positive feedback from the community validated the need for a platform that simplifies collaboration between creators.",
    icon: Trophy
  },
  {
    year: "2024",
    quarter: "Q1",
    title: "Mobile Prototype",
    description: "Developed our first prototype as an Android app with a matching system to connect creators based on their interests and expertise in project development.",
    icon: Rocket
  },
  {
    year: "2024",
    quarter: "Q2",
    title: "Strategic Pivot",
    description: "Shifted to a web platform to create a more comprehensive collaboration ecosystem. Focused on developing integrated project management, storage, and team communication features in one unified platform.",
    icon: Flag
  },
  {
    year: "2024",
    quarter: "Q4",
    title: "Platform Launch",
    description: "Approaching launch: Cliquest will become a home for creators to share ideas, form teams, and execute projects together. A platform where anyone can turn their ideas into reality.",
    icon: Star
  }
];

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
}

function MilestoneCard({ milestone, index }: MilestoneCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative"
    >
      {/* Timeline Line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent" />
      
      {/* Timeline Dot */}
      <div className="absolute -left-[5px] top-[28px] w-[10px] h-[10px] rounded-full bg-zinc-300" />
      
      {/* Content */}
      <div className="pl-8 group">
        {/* Year Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100/50 border border-zinc-200/50 mb-4">
          <span className="text-sm font-semibold text-zinc-800">{milestone.year}</span>
          <span className="text-xs text-zinc-400">•</span>
          <span className="text-sm text-zinc-600">{milestone.quarter}</span>
        </div>

        <div className="relative p-6 bg-gradient-to-b from-white to-zinc-50/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 transition-all duration-500">
          {/* Icon */}
          <div className="absolute -top-4 right-6">
            <div className="relative w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-zinc-200/50 transition-transform duration-300 group-hover:scale-110">
              <milestone.icon weight="duotone" className="w-4 h-4 text-zinc-600" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-black transition-colors duration-300">
              {milestone.title}
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed group-hover:text-zinc-700 transition-colors duration-300">
              {milestone.description}
            </p>
          </div>

          {/* Hover Effects */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-50 to-white opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
        </div>
      </div>
    </motion.div>
  );
}

export function AboutJourney() {
  return (
    <section className="py-32 relative overflow-hidden bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] bg-[size:32px_32px]" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white via-white/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white via-white/50 to-transparent" />
      </div>

      <Container className="relative">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative inline-block mb-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight"
            >
              Our Journey
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-zinc-600 max-w-3xl mx-auto relative"
          >
            The story of our growth and evolution, marked by significant milestones and achievements
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          <div className="space-y-16">
            {milestones.map((milestone, index) => (
              <MilestoneCard key={milestone.title} milestone={milestone} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
} 