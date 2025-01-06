import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../../../../../components/ui/Card';
import { Button } from '../../../../../../../components/ui/Button';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
}

interface ProjectMilestonesProps {
  projectId: string;
}

export function ProjectMilestones({ projectId }: ProjectMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement milestone creation
    setIsAddingMilestone(false);
    setNewMilestone({
      title: '',
      description: '',
      dueDate: ''
    });
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Milestones</h2>
          <Button onClick={() => setIsAddingMilestone(true)}>
            Add Milestone
          </Button>
        </div>

        {isAddingMilestone && (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsAddingMilestone(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Milestone
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="p-4 border border-gray-100 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{milestone.title}</h3>
                <span
                  className={`
                    px-3 py-1 rounded-full text-sm capitalize
                    ${milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                      milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'}
                  `}
                >
                  {milestone.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{milestone.description}</p>
              <div className="text-sm text-gray-500">
                Due: {new Date(milestone.dueDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}