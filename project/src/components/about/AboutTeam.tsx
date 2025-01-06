import { Container } from '../layout/Container';
import { Card } from '../ui/Card';
import { SlideIn } from '../ui/animations/SlideIn';
import { Ripple } from '../ui/animations/Ripple';

const team = [
  {
    name: "Ananda Thareqh Maulana",
    role: "Founder & CEO",
    image: "/team/profile.jpg",
    bio: "A passionate full-stack developer and entrepreneur dedicated to revolutionizing creative collaboration through innovative technology solutions."
  }
];

export function AboutTeam() {
  return (
    <section className="py-24 bg-white">
      <Container>
        <h2 className="text-3xl mb-6">Founding Team</h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl">
          We're looking for passionate co-founders to join us in building the future of creative collaboration. 
          If you're excited about our mission and want to make a significant impact, let's talk.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member) => (
            <SlideIn key={member.name}>
              <Ripple>
                <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mb-6 mx-auto"
                  />
                  <h3 className="text-xl font-medium mb-1 text-center">{member.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 text-center">{member.role}</p>
                  <p className="text-gray-600 text-sm text-center">{member.bio}</p>
                </Card>
              </Ripple>
            </SlideIn>
          ))}
        </div>
      </Container>
    </section>
  );
}