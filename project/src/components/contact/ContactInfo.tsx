import { Container } from '../layout/Container';
import { Card } from '../ui/Card';
import { Pulse } from '../ui/animations/Pulse';

const contactInfo = [
  {
    icon: "✉️",
    title: "Email",
    value: "hello@cliquest.com",
    link: "mailto:hello@cliquest.com"
  },
  {
    icon: "💬",
    title: "Discord",
    value: "Join our community",
    link: "https://discord.gg/cliquest"
  },
  {
    icon: "🌍",
    title: "Location",
    value: "Jakarta, Indonesia",
    link: null
  }
];

export function ContactInfo() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {contactInfo.map((info) => (
              <Card key={info.title} className="p-6 text-center">
                <Pulse>
                  <div className="text-3xl mb-4">{info.icon}</div>
                </Pulse>
                <h3 className="font-medium mb-2">{info.title}</h3>
                {info.link ? (
                  <a 
                    href={info.link}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-gray-600">{info.value}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}