import { FadeScale } from '../ui/animations/FadeScale';
import { Highlight } from '../ui/animations/Highlight';

export function AboutMission() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <FadeScale>
          <h2 className="text-3xl mb-8">Our Mission</h2>
          <div className="prose prose-lg">
            <p className="text-gray-600 mb-6">
              At Cliquest, we believe that great ideas deserve the best environment to flourish. Our mission is to{' '}
              <Highlight className="mx-2">
                empower creative teams with tools that make collaboration seamless and enjoyable
              </Highlight>
              , allowing them to focus on what matters most: bringing innovative ideas to life.
            </p>
            <p className="text-gray-600">
              We're committed to building a platform that not only streamlines project management but also fosters 
              a community where creativity and technical excellence come together.
            </p>
          </div>
        </FadeScale>
      </div>
    </section>
  );
}