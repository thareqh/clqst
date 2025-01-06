import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { FiPlus as PlusIcon, FiCheck as CheckIcon, FiTrash2 as TrashIcon } from 'react-icons/fi';

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface ProjectTasksProps {
  projectId: string;
  isProjectOwner: boolean;
  isProjectMember: boolean;
}

export function ProjectTasks({ projectId, isProjectOwner, isProjectMember }: ProjectTasksProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];

      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleAddTask = async () => {
    if (!user || !newTaskTitle.trim()) return;

    try {
      const newTask = {
        projectId,
        title: newTaskTitle.trim(),
        description: '',
        status: 'todo' as const,
        assignedTo: user.uid,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        priority: 'medium' as const
      };

      await addDoc(collection(db, 'tasks'), newTask);
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isProjectMember && !isProjectOwner) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          You need to be a project member to view tasks
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
        {(isProjectOwner || isProjectMember) && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Task
          </Button>
        )}
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle('');
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {task.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </Button>
                )}
                {(isProjectOwner || task.createdBy === user?.uid) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {tasks.length === 0 && (
          <Card className="p-6">
            <div className="text-center text-gray-500">
              No tasks yet. Click "Add Task" to create one.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 