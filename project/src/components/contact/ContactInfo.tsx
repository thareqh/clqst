import { Container } from '../layout/Container';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { 
  EnvelopeSimple, 
  DiscordLogo, 
  MapPin,
  ArrowRight
} from '@phosphor-icons/react';

const contactInfo = [
  {
    icon: EnvelopeSimple,
    title: "Email",
    description: "Drop us a line anytime",
    value: "anandathareqhm@gmail.com",
    link: "mailto:anandathareqhm@gmail.com"
  },
  {
    icon: DiscordLogo,
    title: "Discord Community",
    description: "Join our growing community",
    value: "Join Discord Server",
    link: "https://discord.gg/cliquest"
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Our home base",
    value: "Cikarang, Indonesia",
    link: null
  }
];

export function ContactInfo() {
  return (
    <section className="py-24 bg-zinc-50/50">
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-zinc-900 mb-4">Connect With Us</h2>
            <p className="text-lg text-zinc-600">Choose your preferred way to reach out</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="group h-full p-8 text-left bg-gradient-to-b from-white to-zinc-50/50 border border-zinc-200/50 hover:border-zinc-300 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <info.icon weight="duotone" className="w-8 h-8 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-2">{info.title}</h3>
                  <p className="text-zinc-600 mb-4">{info.description}</p>
                  {info.link ? (
                    <a 
                      href={info.link}
                      className="inline-flex items-center text-zinc-900 hover:text-zinc-600 font-medium transition-colors group/link"
                    >
                      {info.value}
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                    </a>
                  ) : (
                    <p className="text-zinc-900 font-medium">{info.value}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}