import { Container } from '../layout/Container';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';
import { ArrowRight, PaperPlaneTilt } from '@phosphor-icons/react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await emailjs.send(
        'service_wuv6iqp',
        'template_136755b',
        {
          from_name: formData.name,
          reply_to: formData.email,
          subject: formData.subject,
          message: formData.message
        },
        'm_TQaJSuxHIMwjGOD'
      );

      if (result.text === 'OK') {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Error sending email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-white relative">
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Card className="group p-8 md:p-12 bg-gradient-to-b from-white to-zinc-50/50 border border-zinc-200/50 hover:border-zinc-300 transition-all duration-300">
            <div className="text-center mb-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <PaperPlaneTilt weight="duotone" className="w-8 h-8 text-zinc-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-4">Send Us a Message</h2>
              <p className="text-zinc-600">We'll get back to you as soon as possible</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="w-full">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all duration-300"
                    placeholder="Your name"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all duration-300"
                  placeholder="What is this about?"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all duration-300 resize-none"
                  placeholder="Your message here..."
                />
              </div>
              <Button 
                type="submit"
                variant="primary" 
                className="w-full py-4 text-base group-hover:bg-zinc-900 transition-all duration-300"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}