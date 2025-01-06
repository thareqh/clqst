import { motion } from 'framer-motion';

export function CTA() {
  return (
    <div className="bg-blue-600">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Ready to transform your project management?
            <br />
            Start using Cliquest today.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100"
          >
            Join thousands of teams who have already improved their collaboration and productivity with Cliquest.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <a
              href="#get-started"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
            >
              Get started for free
            </a>
            <a
              href="#demo"
              className="text-sm font-semibold leading-6 text-white hover:text-blue-100 transition-colors"
            >
              Schedule a demo <span aria-hidden="true">→</span>
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}