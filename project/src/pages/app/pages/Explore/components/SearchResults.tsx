import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../../../../components/ui/Card';
import type { SearchResult } from '../../../../../types/search';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse h-[200px]">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex gap-2 mt-auto">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600">
          Try adjusting your search or filters to find what you're looking for
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result, index) => (
        <motion.div
          key={result.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link to={result.type === 'project' ? `/app/projects/${result.id}` : `/app/profile/${result.id}`}>
            <Card className="group h-full hover:shadow-lg transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                      {result.title}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full">
                      {result.type}
                    </span>
                  </div>
                  {result.type === 'project' && (
                    <span className="text-2xl">🎯</span>
                  )}
                  {result.type === 'user' && (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {result.description}
                </p>

                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {result.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {result.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        +{result.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}