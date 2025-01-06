import { motion } from 'framer-motion';

export function HowItWorks() {
  return (
    <div className="overflow-hidden bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:pr-8 lg:pt-4"
          >
            <div className="lg:max-w-lg">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                A better way to manage projects
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Experience a streamlined workflow that puts your team's productivity first.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {[
                  {
                    name: 'Create and Plan',
                    description: 'Set up your project, define goals, and create actionable tasks.',
                  },
                  {
                    name: 'Collaborate',
                    description: 'Work together in real-time with your team members.',
                  },
                  {
                    name: 'Track and Analyze',
                    description: 'Monitor progress and make data-driven decisions.',
                  },
                  {
                    name: 'Deliver',
                    description: 'Complete projects on time and exceed expectations.',
                  },
                ].map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <div className="absolute left-1 top-1 h-5 w-5 text-blue-600">•</div>
                      {feature.name}
                    </dt>
                    <dd className="inline ml-1">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <div className="w-full h-[400px] rounded-xl bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Platform Preview</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}