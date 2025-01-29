import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '../../../../../../../components/ui/Button';

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignedRoles: { id: string; title: string }[]) => void;
  roles?: Array<{
    id: string;
    title: string;
    color?: string;
  }>;
  currentAssignedRoles?: Array<{
    id: string;
    title: string;
    color?: string;
  }>;
}

export function AssignRoleModal({ isOpen, onClose, onAssign, roles = [], currentAssignedRoles = [] }: AssignRoleModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentAssignedRoles.map(role => role.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedRoles = roles
      .filter(role => selectedRoles.includes(role.id))
      .map(({ id, title }) => ({ id, title }));
    onAssign(assignedRoles);
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
                    Assign Roles
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
                  {/* Currently Assigned Roles */}
                  {currentAssignedRoles.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Currently Assigned Roles</h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {currentAssignedRoles.map((role) => (
                          <div key={role.id} className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: role.color || '#6B7280' }}
                            />
                            <span className="text-sm text-gray-900">{role.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Roles */}
                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Available Roles</h4>
                    {roles.length > 0 ? (
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
                      disabled={selectedRoles.length === 0}
                    >
                      Assign Roles
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