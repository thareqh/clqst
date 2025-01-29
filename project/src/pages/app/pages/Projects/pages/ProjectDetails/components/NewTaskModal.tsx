import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '@/components/ui/Button';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    title: string; 
    description: string;
    dueDate?: string;
    assignedUsers?: { id: string; name: string }[];
    assignedRoles?: { id: string; title: string }[];
  }) => void;
  members: Array<{
    id: string;
    name: string;
    role?: string;
    avatar?: string;
    photoURL?: string;
    profileImage?: string;
  }>;
  roles?: Array<{
    id: string;
    title: string;
    color?: string;
  }>;
}

export function NewTaskModal({ isOpen, onClose, onSubmit, members, roles }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [assignmentType, setAssignmentType] = useState<'users' | 'roles'>('users');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assignedUsers = selectedUsers.map(userId => {
      const member = members.find(m => m.id === userId);
      return member ? { id: member.id, name: member.name } : null;
    }).filter((user): user is { id: string; name: string } => user !== null);

    const assignedRoles = selectedRoles.map(roleId => {
      const role = roles?.find(r => r.id === roleId);
      return role ? { id: role.id, title: role.title } : null;
    }).filter((role): role is { id: string; title: string } => role !== null);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || undefined,
      assignedUsers,
      assignedRoles
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedUsers([]);
    setSelectedRoles([]);
    setAssignmentType('users');
  };

  // Helper function untuk mendapatkan avatar URL
  const getAvatarUrl = (member: typeof members[0]): string | null => {
    if (!member) return null;
    // Cek dan return URL yang valid
    const possibleUrls = [member.profileImage, member.photoURL, member.avatar];
    for (const url of possibleUrls) {
      if (url && url.startsWith('http')) {
        return url;
      }
    }
    return null;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    Create New Task
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a new task to track project progress
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="p-6 space-y-6">
                    {/* Task Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Task Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter task title"
                        required
                      />
                    </div>

                    {/* Task Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Describe the task in detail..."
                        required
                      />
                    </div>

                    {/* Due Date */}
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <input
                        type="datetime-local"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    {/* Assignment Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign Task To
                      </label>
                      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setAssignmentType('users')}
                          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            assignmentType === 'users'
                              ? 'bg-white shadow text-gray-900'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          Users
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignmentType('roles')}
                          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            assignmentType === 'roles'
                              ? 'bg-white shadow text-gray-900'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          Roles
                        </button>
                      </div>
                    </div>

                    {/* User Selection */}
                    {assignmentType === 'users' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Users
                        </label>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                          {members.map((member) => (
                            <label
                              key={member.id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers([...selectedUsers, member.id]);
                                  } else {
                                    setSelectedUsers(selectedUsers.filter(id => id !== member.id));
                                  }
                                }}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <div className="ml-3 flex items-center gap-2 min-w-0">
                                <div className="flex-shrink-0">
                                  {getAvatarUrl(member) ? (
                                    <img 
                                      src={getAvatarUrl(member)!}
                                      alt={member.name}
                                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
                                      }}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 ring-2 ring-white flex items-center justify-center">
                                      <span className="text-sm font-medium text-gray-600">
                                        {member.name[0].toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="truncate">
                                  <span className="text-sm font-medium text-gray-900">{member.name}</span>
                                  {member.role && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                      {member.role}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Role Selection */}
                    {assignmentType === 'roles' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Roles
                        </label>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                          {roles && roles.length > 0 ? (
                            roles.map((role) => (
                              <label
                                key={role.id}
                                className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRoles.includes(role.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRoles([...selectedRoles, role.id]);
                                    } else {
                                      setSelectedRoles(selectedRoles.filter(id => id !== role.id));
                                    }
                                  }}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <div className="ml-3 flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: role.color || '#6B7280' }}
                                  />
                                  <span className="text-sm text-gray-900">{role.title}</span>
                                </div>
                              </label>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <h3 className="text-sm font-medium text-gray-900 mb-1">
                                No Roles Available
                              </h3>
                              <p className="text-sm text-gray-500">
                                This project doesn't have any roles defined yet.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Create Task
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 