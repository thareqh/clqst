import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../../components/ui/Button';
import { SKILLS } from '../../../../../components/auth/registration/data/skills';
import { PROJECT_TYPES } from '../../../../../components/auth/registration/data/projectTypes';
import { LANGUAGES } from '../../../../../components/auth/registration/data/languages';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterChange: (filters: {
    type: 'all' | 'project' | 'user';
    skills: string[];
    projectTypes: string[];
    languages: string[];
    availability: string;
  }) => void;
}

export function SearchBar({ value, onChange, onFilterChange }: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'project' | 'user'>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [availability, setAvailability] = useState('any');
  
  // Search states
  const [skillsSearch, setSkillsSearch] = useState('');
  const [projectTypesSearch, setProjectTypesSearch] = useState('');
  const [languagesSearch, setLanguagesSearch] = useState('');
  
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterApply = () => {
    onFilterChange({
      type: selectedType,
      skills: selectedSkills,
      projectTypes: selectedProjectTypes,
      languages: selectedLanguages,
      availability
    });
    setShowFilters(false);
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleProjectTypeToggle = (type: string) => {
    setSelectedProjectTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  // Filter functions
  const filteredSkills = SKILLS.filter(skill => 
    skill.toLowerCase().includes(skillsSearch.toLowerCase())
  );

  const filteredProjectTypes = PROJECT_TYPES.filter(type => 
    type.toLowerCase().includes(projectTypesSearch.toLowerCase())
  );

  const filteredLanguages = LANGUAGES.filter(language => 
    language.toLowerCase().includes(languagesSearch.toLowerCase())
  );

  return (
    <div className="relative" ref={filterRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search projects, users, and more..."
            className="w-full h-12 px-4 py-2 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-sm transition-all hover:border-gray-300"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="relative h-12 px-4 rounded-md hover:bg-gray-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {(selectedType !== 'all' || selectedSkills.length > 0 || selectedProjectTypes.length > 0 || selectedLanguages.length > 0 || availability !== 'any') && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[80vh] overflow-y-auto"
          >
            <div className="p-4">
              {/* Type Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Type</h3>
                <div className="space-y-2">
                  {['all', 'project', 'user'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={selectedType === type}
                        onChange={() => setSelectedType(type as typeof selectedType)}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {type === 'all' ? 'All Items' : `${type}s`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Skills</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillsSearch}
                    onChange={(e) => setSkillsSearch(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredSkills.map((skill) => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {skill}
                      </span>
                    </label>
                  ))}
                  {filteredSkills.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      No skills found
                    </div>
                  )}
                </div>
              </div>

              {/* Project Types Filter */}
              {selectedType !== 'user' && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Project Types</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search project types..."
                      value={projectTypesSearch}
                      onChange={(e) => setProjectTypesSearch(e.target.value)}
                      className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {filteredProjectTypes.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProjectTypes.includes(type)}
                          onChange={() => handleProjectTypeToggle(type)}
                          className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {type}
                        </span>
                      </label>
                    ))}
                    {filteredProjectTypes.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        No project types found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Languages Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Languages</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={languagesSearch}
                    onChange={(e) => setLanguagesSearch(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredLanguages.map((language) => (
                    <label key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(language)}
                        onChange={() => handleLanguageToggle(language)}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {language}
                      </span>
                    </label>
                  ))}
                  {filteredLanguages.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      No languages found
                    </div>
                  )}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Availability</h3>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="any">Any</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedType('all');
                    setSelectedSkills([]);
                    setSelectedProjectTypes([]);
                    setSelectedLanguages([]);
                    setAvailability('any');
                    setSkillsSearch('');
                    setProjectTypesSearch('');
                    setLanguagesSearch('');
                    onFilterChange({
                      type: 'all',
                      skills: [],
                      projectTypes: [],
                      languages: [],
                      availability: 'any'
                    });
                  }}
                >
                  Reset
                </Button>
                <Button onClick={handleFilterApply}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}