import { Button } from '../../ui/Button';

interface WizardNavigationProps {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
  isValid?: boolean;
}

export function WizardNavigation({ 
  currentStep, 
  onNext, 
  onBack,
  isLoading,
  isValid = true
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between items-center mt-8">
      {currentStep > 1 ? (
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="w-24"
        >
          Back
        </Button>
      ) : (
        <div className="w-24" />
      )}
      
      <Button
        variant="primary"
        onClick={() => {
          if (!isLoading && isValid) {
            onNext();
          }
        }}
        loading={isLoading}
        disabled={isLoading || !isValid}
        className="w-24"
      >
        {currentStep === 4 ? 'Complete' : 'Next'}
      </Button>
    </div>
  );
}