import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Project, ProjectMember } from '../types/project';

// Create
export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const cleanData = {
      title: projectData.title,
      description: projectData.description,
      shortDescription: projectData.shortDescription,
      phase: projectData.phase,
      category: projectData.category,
      websiteUrl: projectData.websiteUrl || null,
      coverImage: projectData.coverImage || null,
      skills: projectData.skills || [],
      requiredRoles: projectData.requiredRoles || [],
      status: projectData.status || 'open',
      visibility: projectData.visibility || 'public',
      tags: projectData.tags || [],
      owner: {
        id: projectData.owner.id,
        name: projectData.owner.name,
        avatar: projectData.owner.avatar || null
      },
      members: projectData.members.map(member => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar || null,
        role: member.role,
        joinedAt: member.joinedAt
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'projects'), cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

// Read
export async function getProject(projectId: string): Promise<Project> {
  try {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Project not found');
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Project;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
}

export async function searchProjects(params: {
  query?: string;
  category?: string;
  skills?: string[];
  status?: Project['status'];
  limit?: number;
}): Promise<Project[]> {
  try {
    let q = collection(db, 'projects');
    const constraints: any[] = [];
    
    if (params.query) {
      constraints.push(where('title', '>=', params.query));
      constraints.push(where('title', '<=', params.query + '\uf8ff'));
    }
    
    if (params.category) {
      constraints.push(where('category', '==', params.category));
    }
    
    if (params.skills?.length) {
      constraints.push(where('skills', 'array-contains-any', params.skills));
    }
    
    if (params.status) {
      constraints.push(where('status', '==', params.status));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (params.limit) {
      constraints.push(limit(params.limit));
    }
    
    const querySnapshot = await getDocs(query(q, ...constraints));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      skills: doc.data().skills || []
    })) as Project[];
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
}

// Update
export async function joinProject(projectId: string, member: ProjectMember) {
  try {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      members: arrayUnion(member),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error joining project:', error);
    throw error;
  }
}

export const addProjectImage = async (projectId: string, imageUrl: string) => {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    images: arrayUnion({ url: imageUrl })
  });
};

export const removeProjectImage = async (projectId: string, imageUrl: string) => {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    images: arrayRemove({ url: imageUrl })
  });
};