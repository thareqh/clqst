import { HiOutlineUserGroup, HiOutlineChartBar, HiOutlineClock } from 'react-icons/hi';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Real-time Collaboration',
    description: 'Work together seamlessly with your team in real-time. See changes as they happen.',
    icon: HiOutlineUserGroup,
  },
  {
    name: 'Progress Tracking',
    description: 'Monitor project progress with intuitive dashboards and detailed analytics.',
    icon: HiOutlineChartBar,
  },
  {
    name: 'Time Management',
    description: 'Stay on schedule with smart time tracking and milestone management.',
    icon: HiOutlineClock,
  },
];

export function Features() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage projects effectively
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Powerful features designed to help your team collaborate and deliver results.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col"
              >
                <dt className="text-lg font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}