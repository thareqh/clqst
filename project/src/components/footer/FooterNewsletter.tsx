import { useState } from 'react';
import { motion } from 'framer-motion';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');

  return (
    <div className="bg-gray-50 p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-2">Join Our Newsletter</h3>
      <p className="text-sm text-gray-600 mb-4">
        Get weekly insights on productivity and team collaboration.
      </p>
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="work@company.com"
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          Subscribe Now
        </motion.button>
      </form>
      <p className="text-xs text-gray-500 mt-3">
        ✨ Join 25,000+ subscribers. No spam, unsubscribe anytime.
      </p>
    </div>
  );
}