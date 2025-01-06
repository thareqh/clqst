import { Card } from '../ui/Card';
import { Pulse } from '../ui/animations/Pulse';
import { Container } from '../layout/Container';

const values = [
  {
    icon: "💡",
    title: "Innovation First",
    description: "We constantly push boundaries and explore new possibilities in project collaboration."
  },
  {
    icon: "🤝",
    title: "Community Driven",
    description: "Our platform grows and evolves with input from our vibrant community of creators."
  },
  {
    icon: "✨",
    title: "Quality Focused",
    description: "We maintain the highest standards in everything we create and deliver."
  },
  {
    icon: "🌍",
    title: "Global Impact",
    description: "We're building tools that empower teams regardless of their location."
  }
];

export function AboutValues() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <h2 className="text-3xl mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value) => (
            <Card 
              key={value.title} 
              className="p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <Pulse>
                <div className="text-3xl mb-4">{value.icon}</div>
              </Pulse>
              <h3 className="text-xl font-medium mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}