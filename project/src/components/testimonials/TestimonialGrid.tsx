import { motion } from 'framer-motion';
import { TestimonialCard } from './TestimonialCard';

const testimonials = [
  {
    quote: "Cliquest has transformed how our small team collaborates. The real-time updates are a game-changer.",
    author: "Sarah Chen",
    role: "Product Designer",
    company: "DesignFlow",
    emoji: "👩‍🎨"
  },
  {
    quote: "As an early adopter, I've seen Cliquest evolve. Their attention to user feedback is impressive.",
    author: "Marcus Rodriguez",
    role: "Frontend Developer",
    company: "Freelance",
    emoji: "👨‍💻"
  },
  {
    quote: "The project space system helps our remote team stay organized. It's exactly what we needed.",
    author: "Emily Zhang",
    role: "Project Manager",
    company: "TechStart",
    emoji: "👩‍💼"
  }
];

export function TestimonialGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.author}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          <TestimonialCard {...testimonial} />
        </motion.div>
      ))}
    </div>
  );
}