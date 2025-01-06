import { Container } from '../layout/Container';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FadeScale } from '../ui/animations/FadeScale';

export function BlogNewsletter() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <div className="max-w-2xl mx-auto">
          <FadeScale>
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-medium mb-4">Stay Updated</h2>
              <p className="text-gray-600 mb-6">
                Get the latest updates on product features, company news, and industry insights.
              </p>
              <form className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <Button variant="primary">Subscribe</Button>
              </form>
            </Card>
          </FadeScale>
        </div>
      </Container>
    </section>
  );
}