import { useState } from 'react';
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
    <section className="py-24 bg-gray-50" id="pricing">
      <Container>
        <PricingHeader />
        <div className="grid md:grid-cols-3 gap-8">
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