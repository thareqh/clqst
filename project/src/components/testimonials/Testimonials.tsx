import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { Quotes } from "@phosphor-icons/react";

const testimonials = [
  {
    name: 'Mike Johnson',
    role: 'Computer Science Student',
    company: 'San Jose State University',
    content: 'I had this idea for an AI-powered study app but needed help with the UI/UX design. On Cliquest, I found two design students and a backend developer. The built-in task management and chat features made our collaboration super smooth.',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    name: 'Lisa Chen',
    role: 'UI/UX Designer',
    company: 'Upwork & Fiverr Freelancer',
    content: 'Instead of constantly switching between Slack, Trello, and Drive, Cliquest gives me everything in one place. I joined three projects in the past month and love how easy it is to share designs and get feedback.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    name: 'David Martinez',
    role: 'Junior Developer',
    company: 'Self-taught Programmer',
    content: 'As someone who learned coding through online courses, finding real projects to work on was challenging. Through Cliquest, I joined a team building an e-commerce site. The experienced developers on the team have helped me grow so much.',
    image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200&q=80'
  }
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.23, 1, 0.32, 1] // Cubic bezier untuk efek yang lebih menarik
      }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative group"
    >
      <div className="relative p-10 bg-gradient-to-b from-white to-zinc-50/50 backdrop-blur-xl rounded-2xl transition-all duration-700 border border-zinc-200/50 group-hover:border-zinc-300/50 shadow-lg shadow-zinc-100/50 h-full">
        {/* Quote Icon */}
        <div className="absolute -top-4 -left-2">
          <motion.div 
            className="relative w-8 h-8 rounded-full bg-gradient-to-br from-white to-zinc-50 border border-zinc-100 shadow-md flex items-center justify-center"
            whileHover={{ 
              scale: 1.2,
              rotate: 12,
              transition: { type: "spring", stiffness: 300 }
            }}
          >
            <Quotes 
              weight="fill"
              className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors duration-500"
            />
          </motion.div>
        </div>

        {/* Profile Section */}
        <div className="flex items-center space-x-4 mb-6">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-700">
              <img 
                src={testimonial.image} 
                alt={testimonial.name}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/20"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {/* Decorative Ring dengan efek glow */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-zinc-200/50 to-zinc-100/50 rounded-2xl -z-10 blur group-hover:blur-md transition-all duration-700">
              <motion.div
                className="w-full h-full rounded-2xl"
                animate={{
                  background: [
                    "linear-gradient(to right top, rgba(244,244,245,0.5), rgba(228,228,231,0.5))",
                    "linear-gradient(to right top, rgba(228,228,231,0.5), rgba(244,244,245,0.5))"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
          </motion.div>
          
          <div>
            <motion.h3 
              className="text-base font-medium text-zinc-900 group-hover:text-black transition-colors duration-500"
              whileHover={{ x: 3 }}
            >
              {testimonial.name}
            </motion.h3>
            <p className="text-sm text-zinc-500 group-hover:text-zinc-600 transition-colors duration-500">
              {testimonial.role}, {testimonial.company}
            </p>
          </div>
        </div>

        {/* Content */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          <p className="text-zinc-600 leading-relaxed group-hover:text-zinc-700 transition-colors duration-700">
            "{testimonial.content}"
          </p>
        </motion.div>

        {/* Hover Effects - Gradient Glow */}
        <div className="absolute inset-0 rounded-2xl transition-all duration-700 opacity-0 group-hover:opacity-100">
          <motion.div
            className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-white to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-zinc-100 via-white to-zinc-50">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:32px_32px] opacity-50" />
        
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
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
        </motion.div>
      </div>

      <Container className="relative">
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4"
          >
            Testimonials
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-semibold mb-6 text-zinc-900 tracking-tight"
          >
            Success Stories
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-600 text-lg max-w-2xl mx-auto"
          >
            Discover how creators like you are bringing their ideas to life with Cliquest
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.name} 
              testimonial={testimonial} 
              index={index} 
            />
          ))}
        </div>
      </Container>
    </section>
  );
}