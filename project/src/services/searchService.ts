import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  QueryConstraint,
  DocumentData,
  CollectionReference
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { SearchResult } from '../types/search';
import { COUNTRIES } from '../components/auth/registration/data/countries';
import { logger } from '@/utils/logger';

interface SearchParams {
  query: string;
  type?: 'all' | 'project' | 'user';
  skills?: string[];
  projectTypes?: string[];
  languages?: string[];
  availability?: string;
  limit?: number;
}

interface ProjectData extends DocumentData {
  title: string;
  description: string;
  skills: string[];
  createdAt: string;
  status: 'draft' | 'open' | 'in-progress' | 'completed';
  coverImage?: string | null;
  owner: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  members: Array<{
    id: string;
    name: string;
    avatar?: string | null;
    role: string;
    joinedAt: string;
  }>;
  phase: string;
  category: string;
  visibility: 'public' | 'private';
  requiredRoles: Array<{
    title: string;
    description: string;
    skills: string[];
    isRequired: boolean;
  }>;
}

interface UserData extends DocumentData {
  fullName: string;
  bio?: string;
  skills: string[];
  createdAt: string;
  avatar?: string | null;
  availability: 'available' | 'busy';
  country?: string;
  professionalTitle?: string;
  experienceLevel?: string;
  yearsOfExperience?: number;
  languages?: string[];
  collaborationStyles?: string[];
  weeklyAvailability?: number;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  stats: {
    projectsCount: number;
    followersCount: number;
    followingCount: number;
  };
}

const PROJECTS_COLLECTION = 'projects';
const USERS_COLLECTION = 'users';

export async function search({ query: searchQuery, type = 'all', skills = [], projectTypes = [], languages = [], availability = 'any', limit: resultLimit = 20 }: SearchParams): Promise<SearchResult[]> {
  try {
    const results: SearchResult[] = [];
    const trimmedQuery = searchQuery?.trim().toLowerCase() || '';
    logger.debug('Search params:', { query: trimmedQuery, type, skillsCount: skills.length, projectTypesCount: projectTypes.length, languagesCount: languages.length, availability, limit: resultLimit });

    // Mencari Projects
    if (type === 'all' || type === 'project') {
      const projectConstraints: QueryConstraint[] = [];

      if (skills.length > 0) {
        projectConstraints.push(where('skills', 'array-contains-any', skills));
      }

      if (projectTypes.length > 0) {
        projectConstraints.push(where('type', 'in', projectTypes));
      }

      projectConstraints.push(orderBy('createdAt', 'desc'));
      projectConstraints.push(limit(resultLimit));

      logger.debug('Querying projects');
      const projectsRef = collection(db, PROJECTS_COLLECTION);
      const projectsQuery = query(projectsRef, ...projectConstraints);
      const projectsSnapshot = await getDocs(projectsQuery);
      logger.info('Found projects:', { count: projectsSnapshot.size });

      const projectResults = projectsSnapshot.docs
        .map(doc => {
          const data = doc.data() as ProjectData;
          logger.debug('Processing project data');
          return {
            id: doc.id,
            type: 'project' as const,
            title: data.title || '',
            description: data.description || '',
            createdAt: data.createdAt,
            tags: data.skills || [],
            coverImage: data.coverImage,
            status: data.status || 'open',
            owner: data.owner || { id: '1', name: 'Project Owner' },
            members: data.members || [],
            phase: data.phase || 'planning',
            category: data.category || 'other',
            visibility: data.visibility || 'public',
            requiredRoles: data.requiredRoles || []
          };
        })
        .filter(project => {
          if (!trimmedQuery) return true;
          
          const titleMatch = project.title.toLowerCase().includes(trimmedQuery);
          const descriptionMatch = project.description.toLowerCase().includes(trimmedQuery);
          const skillsMatch = project.tags.some(tag => tag.toLowerCase().includes(trimmedQuery));
          const categoryMatch = project.category.toLowerCase().includes(trimmedQuery);
          
          return titleMatch || descriptionMatch || skillsMatch || categoryMatch;
        });

      results.push(...projectResults);
    }
    
    // Mencari Users
    if (type === 'all' || type === 'user') {
      const userConstraints: QueryConstraint[] = [];

      if (skills.length > 0) {
        userConstraints.push(where('skills', 'array-contains-any', skills));
      }

      if (languages.length > 0) {
        userConstraints.push(where('languages', 'array-contains-any', languages));
      }

      if (availability !== 'any') {
        userConstraints.push(where('availability', '==', availability));
      }

      userConstraints.push(orderBy('createdAt', 'desc'));
      userConstraints.push(limit(resultLimit));

      logger.debug('Querying users');
      const usersRef = collection(db, USERS_COLLECTION);
      const usersQuery = query(usersRef, ...userConstraints);
      const usersSnapshot = await getDocs(usersQuery);
      logger.info('Found users:', { count: usersSnapshot.size });

      const userResults = usersSnapshot.docs
        .map(doc => {
          const rawData = doc.data();
          logger.debug('Processing user data');
          
          const avatarUrl = rawData.photoURL || rawData.avatar || rawData.profilePicture || rawData.profileImage || rawData.photo || null;

          const data = {
            ...rawData,
            avatar: avatarUrl
          } as UserData;

          return {
            id: doc.id,
            type: 'user' as const,
            title: data.fullName || '',
            description: data.bio || '',
            createdAt: data.createdAt,
            tags: data.skills || [],
            avatar: data.avatar,
            availability: data.availability || 'available',
            location: data.country || 'Remote',
            professionalTitle: data.professionalTitle || '',
            experienceLevel: data.experienceLevel || '',
            yearsOfExperience: data.yearsOfExperience || 0,
            languages: data.languages || [],
            collaborationStyles: data.collaborationStyles || [],
            weeklyAvailability: data.weeklyAvailability || 0,
            socialLinks: data.socialLinks || {},
            stats: data.stats || {
              projectsCount: 0,
              followersCount: 0,
              followingCount: 0
            }
          };
        })
        .filter(user => {
          if (!trimmedQuery) return true;
          
          const nameMatch = user.title.toLowerCase().includes(trimmedQuery);
          const bioMatch = user.description.toLowerCase().includes(trimmedQuery);
          const skillsMatch = user.tags.some(tag => tag.toLowerCase().includes(trimmedQuery));
          const titleMatch = user.professionalTitle?.toLowerCase().includes(trimmedQuery) || false;
          const locationMatch = user.location.toLowerCase().includes(trimmedQuery);
          
          return nameMatch || bioMatch || skillsMatch || titleMatch || locationMatch;
        });

      results.push(...userResults);
    }

    logger.info('Search completed', { resultCount: results.length });
    return results;
  } catch (error) {
    logger.error('Error searching:', error);
    throw error;
  }
}

export const searchUsers = async (searchTerm: string, currentUserId: string) => {
  try {
    logger.info('Searching users with term:', { searchTerm });
    
    const constraints = [
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      limit(10)
    ];

    logger.debug('Query constraints:', constraints);
    
    const usersQuery = query(collection(db, 'users'), ...constraints);
    const snapshot = await getDocs(usersQuery);
    
    const users = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user => user.id !== currentUserId);

    logger.info('Found users:', users.length);
    return users;
  } catch (error) {
    logger.error('Error searching users:', error);
    throw error;
  }
};