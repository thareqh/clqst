import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../../components/ui/Card';
import { ProjectCard } from '../../../../components/projects/ProjectCard';
import { UserCard } from '../../../../components/users/UserCard.js';
import { SearchBar } from './components/SearchBar';
import { search } from '../../../../services/searchService';
import type { SearchResult } from '../../../../types/search';
import type { Project } from '../../../../types/project';
import type { User } from '../../../../types/user';
import { Tab } from '@headlessui/react';
import { Separator } from '../../../../components/ui/Separator';
import clsx from 'clsx';

type FilterType = 'all' | 'project' | 'user';

interface Filters {
  type: FilterType;
  skills: string[];
  projectTypes: string[];
  languages: string[];
  availability: string;
}

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    skills: [],
    projectTypes: [],
    languages: [],
    availability: 'any'
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      try {
        const searchResults = await search({
          query: searchQuery,
          type: filters.type,
          skills: filters.skills,
          projectTypes: filters.projectTypes,
          languages: filters.languages,
          availability: filters.availability,
          limit: 20
        });
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  const projectResults = results.filter(result => result.type === 'project');
  const userResults = results.filter(result => result.type === 'user');

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <div className="relative w-full pt-[56.25%] bg-gray-50" />
          <div className="p-6">
            <div className="h-6 bg-gray-100 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-100 rounded w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-gray-100 rounded w-16" />
              <div className="h-6 bg-gray-100 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="border rounded-lg p-8 text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada hasil ditemukan</h3>
      <p className="text-gray-600">
        Coba sesuaikan pencarian atau filter Anda untuk menemukan yang Anda cari
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Explore</h1>
          <p className="text-gray-500 mt-1">Discover amazing projects and talented people</p>
        </div>

        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          onFilterChange={setFilters}
        />
      </div>

      <Separator className="my-6" />

      {/* Active Filters */}
      {(filters.skills.length > 0 || filters.projectTypes.length > 0 || filters.languages.length > 0 || filters.availability !== 'any') && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.skills.map(skill => (
              <span
                key={`skill-${skill}`}
                className="inline-flex items-center px-3 py-1 border rounded-full text-sm text-gray-700 bg-gray-50"
              >
                <span>{skill}</span>
                <button
                  onClick={() => setFilters({
                    ...filters,
                    skills: filters.skills.filter(s => s !== skill)
                  })}
                  className="ml-2 focus:outline-none hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.projectTypes.map(type => (
              <span
                key={`type-${type}`}
                className="inline-flex items-center px-3 py-1 border rounded-full text-sm text-gray-700 bg-gray-50"
              >
                <span>{type}</span>
                <button
                  onClick={() => setFilters({
                    ...filters,
                    projectTypes: filters.projectTypes.filter(t => t !== type)
                  })}
                  className="ml-2 focus:outline-none hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.languages.map(language => (
              <span
                key={`language-${language}`}
                className="inline-flex items-center px-3 py-1 border rounded-full text-sm text-gray-700 bg-gray-50"
              >
                <span>{language}</span>
                <button
                  onClick={() => setFilters({
                    ...filters,
                    languages: filters.languages.filter(l => l !== language)
                  })}
                  className="ml-2 focus:outline-none hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.availability !== 'any' && (
              <span
                className="inline-flex items-center px-3 py-1 border rounded-full text-sm text-gray-700 bg-gray-50"
              >
                <span>Availability: {filters.availability}</span>
                <button
                  onClick={() => setFilters({
                    ...filters,
                    availability: 'any'
                  })}
                  className="ml-2 focus:outline-none hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <Separator className="my-6" />
        </div>
      )}

      {/* Tabs */}
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex border rounded-lg mb-6 bg-gray-100 divide-x divide-gray-200">
          <Tab
            className={({ selected }) =>
              clsx(
                'w-full py-2.5 text-sm font-medium leading-5 flex items-center justify-center transition-all duration-200',
                'focus:outline-none',
                selected
                  ? 'bg-white text-gray-900 rounded-l-lg'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              )
            }
          >
            Projects ({projectResults.length})
          </Tab>
          <Tab
            className={({ selected }) =>
              clsx(
                'w-full py-2.5 text-sm font-medium leading-5 flex items-center justify-center transition-all duration-200',
                'focus:outline-none',
                selected
                  ? 'bg-white text-gray-900 rounded-r-lg'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              )
            }
          >
            Users ({userResults.length})
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel
            className={clsx(
              'rounded-xl focus:outline-none'
            )}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1400px] mx-auto">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="relative w-full pt-[56.25%] bg-gray-50" />
                    <div className="p-6">
                      <div className="h-6 bg-gray-100 rounded w-3/4 mb-4" />
                      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
                      <div className="flex gap-2 mt-4">
                        <div className="h-6 bg-gray-100 rounded w-16" />
                        <div className="h-6 bg-gray-100 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projectResults.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters to find what you're looking for
                </p>
              </div>
            ) : (
              <motion.div
                key="project-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1400px] mx-auto"
              >
                {projectResults.map((result, index) => (
                  <motion.div
                    key={`project-${result.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProjectCard
                      project={{
                        id: result.id,
                        title: result.title || '',
                        description: result.description || '',
                        shortDescription: result.shortDescription || result.description?.slice(0, 150) || '',
                        coverImage: result.coverImage || '/images/project-placeholder.jpg',
                        status: result.status === 'in-progress' ? 'open' : (result.status as 'open' | 'closed' | 'completed' | 'archived') || 'open',
                        skills: result.tags || [],
                        owner: {
                          id: result.owner?.id || '1',
                          name: result.owner?.name || 'Project Owner',
                          avatar: result.owner?.avatar || undefined
                        },
                        members: result.members?.map(member => ({
                          id: member.id,
                          name: member.name,
                          avatar: member.avatar || undefined,
                          role: member.role,
                          skills: member.skills || [],
                          joinedAt: member.joinedAt || result.createdAt
                        })) || [],
                        phase: (result.phase as 'idea' | 'prototype' | 'development' | 'growth' | 'maintenance') || 'idea',
                        category: (result.category as 'web' | 'mobile' | 'desktop' | 'other') || 'other',
                        visibility: result.visibility || 'public',
                        tags: result.tags || [],
                        requiredRoles: result.requiredRoles?.map(role => ({
                          ...role,
                          color: role.color || '#94A3B8'
                        })) || [],
                        createdAt: result.createdAt,
                        updatedAt: result.createdAt
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Tab.Panel>

          <Tab.Panel
            className={clsx(
              'rounded-xl focus:outline-none'
            )}
          >
            {isLoading ? (
              renderSkeletons()
            ) : userResults.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters to find what you're looking for
                </p>
              </div>
            ) : (
              <motion.div
                key="user-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {userResults.map((result, index) => (
                  <motion.div
                    key={`user-${result.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <UserCard
                      user={{
                        id: result.id,
                        fullName: result.title || 'Anonymous User',
                        bio: result.description || '',
                        avatar: result.avatar || undefined,
                        skills: result.tags || [],
                        availability: result.availability || 'available',
                        location: result.location || 'Remote',
                        professionalTitle: result.professionalTitle || '',
                        experienceLevel: result.experienceLevel || '',
                        yearsOfExperience: result.yearsOfExperience || 0,
                        languages: result.languages || [],
                        collaborationStyles: result.collaborationStyles || [],
                        weeklyAvailability: result.weeklyAvailability || 0,
                        socialLinks: result.socialLinks || {},
                        stats: result.stats || {
                          projectsCount: 0,
                          followersCount: 0,
                          followingCount: 0
                        },
                        joinedAt: result.createdAt
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}