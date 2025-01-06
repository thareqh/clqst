import { Container } from '../layout/Container';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FadeScale } from '../ui/animations/FadeScale';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
      // Ganti dengan SERVICE_ID, TEMPLATE_ID, dan PUBLIC_KEY dari akun EmailJS Anda
      const result = await emailjs.send(
        'service_wuv6iqp',
        'template_136755b',
        {
          from_name: formData.name,
          reply_to: formData.email,
          message: formData.message
        },
        'm_TQaJSuxHIMwjGOD'
      );

      if (result.text === 'OK') {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Error sending email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="max-w-3xl mx-auto">
          <FadeScale>
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="w-full">
                    <label className="block text-sm text-gray-600 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm text-gray-600 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label className="block text-sm text-gray-600 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-6 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                  />
                </div>
                <Button 
                  type="submit"
                  variant="primary" 
                  className="w-full py-3 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </FadeScale>
        </div>
      </Container>
    </section>
  );
}