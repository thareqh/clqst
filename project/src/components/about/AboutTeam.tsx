import { motion } from 'framer-motion';
import { Container } from '../layout/Container';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  gradient: string;
}

const team: TeamMember[] = [
  {
    name: "Ananda Thareqh Maulana",
    role: "Founder & CEO",
    image: "/team/profile.jpg",
    bio: "A passionate full-stack developer and entrepreneur dedicated to revolutionizing creative collaboration through innovative technology solutions.",
    gradient: 'from-zinc-200 to-zinc-400'
  },
  {
    name: "Arron Taylor",
    role: "Co-Founder & VP of Engineering",
    image: "/team/arron.jpg",
    bio: "Senior Software Engineer with expertise in scalable systems using React, Angular, .NET, and cloud platforms. Passionate about building user-focused solutions and bringing innovative ideas to life through sustainable architecture and creative problem-solving.",
    gradient: 'from-zinc-300 to-zinc-500'
  },
  {
    name: "Fazryan Syahdewo",
    role: "Co-Founder & Head of Marketing",
    image: "/team/ryan.jpg",
    bio: "Young and enthusiastic marketing professional with a fresh perspective on social media strategy and digital engagement. Focused on building authentic community connections and creative content development.",
    gradient: 'from-zinc-400 to-zinc-600'
  }
];

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

function TeamCard({ member, index }: TeamCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative group"
    >
      <div className="relative p-8 bg-gradient-to-b from-white to-zinc-50/50 backdrop-blur-xl rounded-2xl transition-all duration-500 border border-zinc-200/50 hover:border-zinc-300">
        {/* Animated Background */}
        <div className="absolute inset-0 rounded-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-100/0 to-zinc-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
        </div>

        {/* Profile Image Container */}
        <div className="relative mb-8">
          <motion.div 
            className="relative w-32 h-32 mx-auto"
            whileHover={{ 
              scale: 1.05,
              transition: { 
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
          >
            {/* Image Container */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-zinc-100" />
                  <img 
                    src={member.image} 
                    alt={member.name}
                className="relative w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=128`;
                }}
              />
              
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="relative text-center space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-zinc-900 mb-1 transition-colors duration-300 group-hover:text-black">
              {member.name}
            </h3>
            <p className="text-sm font-medium text-zinc-500 transition-colors duration-300 group-hover:text-zinc-700">
              {member.role}
            </p>
          </motion.div>

          <motion.div 
            className="relative px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-sm text-zinc-600 leading-relaxed transition-colors duration-300 group-hover:text-zinc-800">
              {member.bio}
            </p>
            
            {/* Side Lines */}
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        </div>

        {/* Card Border Gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-50 to-white opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
      </div>
    </motion.div>
  );
}

export function AboutTeam() {
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
              Meet Our Team
            </motion.h2>
          </div>

          <div className="relative">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-zinc-600 max-w-3xl mx-auto"
            >
              The passionate individuals behind Cliquest who are dedicated to making creative collaboration seamless and enjoyable
            </motion.p>
            <motion.div 
              className="absolute -left-4 top-1/2 w-8 h-px bg-zinc-200"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            />
            <motion.div 
              className="absolute -right-4 top-1/2 w-8 h-px bg-zinc-200"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            />
          </div>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {team.map((member, index) => (
            <TeamCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}