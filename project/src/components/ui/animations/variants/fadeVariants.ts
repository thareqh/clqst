import { Variants } from 'framer-motion';

export const createFadeVariants = (prefersReduced: boolean, delay: number = 0): Variants => {
  return prefersReduced 
    ? {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration: 0.5, delay }
        }
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, delay }
        }
      };
};