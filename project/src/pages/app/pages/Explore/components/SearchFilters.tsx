import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SKILLS } from '../../../../../components/auth/registration/data/skills';

type FilterType = 'all' | 'project' | 'user';

interface Filters {
  type: FilterType;
  skills: string[];
  availability: string;
}

interface SearchFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleTypeChange = (type: FilterType) => {
    onChange({ ...filters, type });
  };

  const handleSkillChange = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    onChange({ ...filters, skills: newSkills });
  };

  // Filter skills berdasarkan pencarian
  const filteredSkills = SKILLS.filter(skill =>
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Type Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Type</h3>
        <div className="space-y-3">
          {['all', 'project', 'user'].map((type) => (
            <motion.label
              key={type}
              className="flex items-center cursor-pointer group"
              whileHover={{ x: 4 }}
            >
              <input
                type="radio"
                name="type"
                value={type}
                checked={filters.type === type}
                onChange={() => handleTypeChange(type as FilterType)}
                className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <motion.span 
                className="ml-3 text-sm text-gray-700 capitalize group-hover:text-gray-900"
                whileHover={{ x: 2 }}
              >
                {type === 'all' ? 'All Items' : `${type}s`}
              </motion.span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Skills Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Skills</h3>
        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        {/* Skills list */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {filteredSkills.map((skill) => (
            <motion.label
              key={skill}
              className="flex items-center cursor-pointer group"
              whileHover={{ x: 4 }}
            >
              <input
                type="checkbox"
                checked={filters.skills.includes(skill)}
                onChange={() => handleSkillChange(skill)}
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <motion.span 
                className="ml-3 text-sm text-gray-700 group-hover:text-gray-900"
                whileHover={{ x: 2 }}
              >
                {skill}
              </motion.span>
            </motion.label>
          ))}
          {filteredSkills.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">No skills found</p>
          )}
        </div>
      </div>

      {/* Availability Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Availability</h3>
        <select
          value={filters.availability}
          onChange={(e) => onChange({ ...filters, availability: e.target.value })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="any">Any</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
        </select>
      </div>
    </div>
  );
}