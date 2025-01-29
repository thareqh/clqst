import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../../components/ui/Button';
import { SKILLS } from '../../../../../components/auth/registration/data/skills';
import { PROJECT_TYPES } from '../../../../../components/auth/registration/data/projectTypes';
import { LANGUAGES } from '../../../../../components/auth/registration/data/languages';
import { Popover, Dialog } from '@headlessui/react';
import { MagnifyingGlassIcon as SearchIcon, FunnelIcon as FilterIcon } from '@heroicons/react/24/outline';

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
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-500 
              focus:outline-none focus:border-gray-400 focus:ring-0
              bg-gray-50 hover:bg-white focus:bg-white transition-colors"
            placeholder="Search projects, users, skills..."
          />
        </div>

        <button
          onClick={() => setShowFilters(true)}
          className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium 
            text-gray-700 bg-gray-50 hover:bg-white hover:border-gray-300 focus:outline-none focus:border-gray-400
            transition-colors gap-2"
        >
          <FilterIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span>Filters</span>
        </button>

        <Dialog
          open={showFilters}
          onClose={() => setShowFilters(false)}
          className="fixed inset-0 z-10 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <Dialog.Overlay className="fixed inset-0 bg-black/30" />

            <div className="relative bg-white rounded-lg w-full max-w-md mx-auto p-6">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Filter Results
              </Dialog.Title>

              <div className="space-y-6">
                {/* Type Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Type</h3>
                  <div className="space-y-2">
                    {['all', 'project', 'user'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={selectedType === type}
                          onChange={() => setSelectedType(type as typeof selectedType)}
                          className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-0"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {type === 'all' ? 'All Items' : `${type}s`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skills Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Skills</h3>
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillsSearch}
                    onChange={(e) => setSkillsSearch(e.target.value)}
                    className="w-full px-3 py-2 mb-2 text-sm border border-gray-200 rounded-lg 
                      bg-gray-50 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-0
                      hover:bg-white focus:bg-white transition-colors"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {filteredSkills.map((skill) => (
                      <label key={skill} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill)}
                          onChange={() => {
                            setSelectedSkills(prev => 
                              prev.includes(skill)
                                ? prev.filter(s => s !== skill)
                                : [...prev, skill]
                            );
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-0"
                        />
                        <span className="ml-2 text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Project Types Filter */}
                {selectedType !== 'user' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Project Types</h3>
                    <input
                      type="text"
                      placeholder="Search project types..."
                      value={projectTypesSearch}
                      onChange={(e) => setProjectTypesSearch(e.target.value)}
                      className="w-full px-3 py-2 mb-2 text-sm border border-gray-200 rounded-lg 
                        bg-gray-50 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-0
                        hover:bg-white focus:bg-white transition-colors"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                      {filteredProjectTypes.map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProjectTypes.includes(type)}
                            onChange={() => {
                              setSelectedProjectTypes(prev => 
                                prev.includes(type)
                                  ? prev.filter(t => t !== type)
                                  : [...prev, type]
                              );
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-0"
                          />
                          <span className="ml-2 text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Languages</h3>
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={languagesSearch}
                    onChange={(e) => setLanguagesSearch(e.target.value)}
                    className="w-full px-3 py-2 mb-2 text-sm border border-gray-200 rounded-lg 
                      bg-gray-50 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-0
                      hover:bg-white focus:bg-white transition-colors"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {filteredLanguages.map((language) => (
                      <label key={language} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(language)}
                          onChange={() => {
                            setSelectedLanguages(prev => 
                              prev.includes(language)
                                ? prev.filter(l => l !== language)
                                : [...prev, language]
                            );
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-0"
                        />
                        <span className="ml-2 text-sm text-gray-700">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg 
                      bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-0
                      hover:bg-white focus:bg-white transition-colors"
                  >
                    <option value="any">Any</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedType('all');
                      setSelectedSkills([]);
                      setSelectedProjectTypes([]);
                      setSelectedLanguages([]);
                      setAvailability('any');
                      onFilterChange({
                        type: 'all',
                        skills: [],
                        projectTypes: [],
                        languages: [],
                        availability: 'any'
                      });
                      setShowFilters(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg
                      hover:border-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleFilterApply}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 
                      rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-0 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}