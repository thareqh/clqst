import { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { PricingHeader } from './pricing/PricingHeader';
import { PricingCard } from './pricing/PricingCard';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import { plans } from './pricing/PricingPlans';

export function Pricing() {
  const { currentUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (planName: string) => {
    if (!currentUser) {
      setSelectedPlan(planName);
      setIsAuthModalOpen(true);
    } else {
      window.location.href = `/checkout?plan=${planName.toLowerCase()}`;
    }
  };

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-zinc-100 via-white to-zinc-50">
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
        <PricingHeader />
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={index}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>
      </Container>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectPath={selectedPlan ? `/checkout?plan=${selectedPlan.toLowerCase()}` : undefined}
      />
    </section>
  );
}