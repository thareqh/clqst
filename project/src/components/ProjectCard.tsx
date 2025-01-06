import { motion } from 'framer-motion';

interface ProjectCardProps {
  name: string;
  description: string;
  image: string;
}

export function ProjectCard({ name, description, image }: ProjectCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-6 border-t border-gray-200"
    >
      <div className="flex items-center gap-6">
        <img src={image} alt={name} className="w-12 h-12 rounded-lg" />
        <div>
          <h3 className="font-medium mb-1">{name}</h3>
          <p className="text-sm text-gray-600 italic">{description}</p>
        </div>
      </div>
      <button className="rounded-full w-10 h-10 flex items-center justify-center border border-gray-200 hover:border-gray-300 transition-colors">
        →
      </button>
    </motion.div>
  );
}