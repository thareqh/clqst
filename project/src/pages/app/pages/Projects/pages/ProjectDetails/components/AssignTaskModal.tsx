import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '../../../../../../../components/ui/Button';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignedUsers: { id: string; name: string }[]) => void;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    photoURL?: string;
    profileImage?: string;
    role?: string;
  }>;
  currentAssignees?: Array<{
    id: string;
    name: string;
    avatar?: string;
    photoURL?: string;
    profileImage?: string;
    role?: string;
  }>;
}

export function AssignTaskModal({ isOpen, onClose, onAssign, members, currentAssignees = [] }: AssignTaskModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(currentAssignees.map(user => user.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUsers = members
      .filter(member => selectedUsers.includes(member.id))
      .map(({ id, name }) => ({ id, name }));
    onAssign(assignedUsers);
  };

  const getAvatarUrl = (member: { avatar?: string; photoURL?: string; profileImage?: string }) => {
    if (!member) return null;
    
    // Log untuk debugging
    console.log('Member data for avatar:', member);
    
    // Cek semua kemungkinan field foto profil
    const avatarUrl = member.profileImage || member.photoURL || member.avatar;
    console.log('Selected avatar URL:', avatarUrl);
    
    return avatarUrl;
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                    Assign Task to Members
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Currently Assigned Section */}
                  {currentAssignees.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Currently Assigned</h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {currentAssignees.map((assignee) => (
                          <div key={assignee.id} className="flex items-center gap-2">
                            {getAvatarUrl(assignee) ? (
                              <img 
                                src={getAvatarUrl(assignee)!}
                                alt={assignee.name}
                                className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}&background=random`;
                                }}
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 ring-2 ring-white flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {assignee.name?.[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-gray-900">{assignee.name}</span>
                            {assignee.role && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                {assignee.role}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Available Members</h4>
                    {members.length > 0 ? (
                      members.map((member) => (
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
                                    {member.name?.[0]?.toUpperCase() || '?'}
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
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          No Members Available
                        </h3>
                        <p className="text-sm text-gray-500">
                          This project doesn't have any members yet.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={selectedUsers.length === 0}
                    >
                      Assign Members
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