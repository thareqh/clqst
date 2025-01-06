import { Container } from '../layout/Container';
import { FadeScale } from '../ui/animations/FadeScale';
import { GradientText } from '../ui/GradientText';

const milestones = [
  {
    year: "2023 Q1",
    title: "Initial Concept",
    description: "Started as a platform to connect people using a Tinder-like system for professional networking."
  },
  {
    year: "2023 Q3",
    title: "Beta Launch",
    description: "Released CLIQUEST beta with core features for project collaboration and team management."
  },
  {
    year: "2024 Q2",
    title: "Public Launch",
    description: "Full platform launch with enhanced features and improved user experience."
  },
  {
    year: "2024 Q3",
    title: "The Pivot",
    description: "Based on user feedback and market research, pivoted from a professional networking platform to focus on creative collaboration and project management."
  },
  {
    year: "Beyond",
    title: "To Be Continued...",
    description: "Join us on our journey to revolutionize creative collaboration."
  }
];

export function AboutTimeline() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <h2 className="text-3xl mb-12">Our Journey</h2>
        <div className="relative">
          <div className="absolute left-[7.5rem] top-0 bottom-0 w-px bg-gray-200" />
          
          <div className="space-y-16">
            {milestones.map((milestone, i) => (
              <FadeScale key={milestone.year} delay={i * 0.1}>
                <div className="flex gap-12 relative">
                  <div className="absolute left-[7.5rem] w-3 h-3 bg-black rounded-full transform -translate-x-1.5 mt-2" />
                  
                  <div className="w-28 flex-shrink-0">
                    <div className="text-lg font-medium">
                      <GradientText>{milestone.year}</GradientText>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              </FadeScale>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}