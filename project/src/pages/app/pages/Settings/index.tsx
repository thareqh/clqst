import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Label from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  IoKeyOutline,
  IoTrashOutline,
} from 'react-icons/io5';

const Settings = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleChangePassword = async () => {
    // Add password change logic here
  };

  const handleDeleteAccount = async () => {
    // Add account deletion logic here
  };

  return (
    <div className="py-8 px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-base text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Security Settings */}
        <Card>
          <CardHeader className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center gap-2 text-gray-600">
              <IoKeyOutline className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Security</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!showChangePassword ? (
              <div className="px-6 py-4 flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setShowChangePassword(true)}>
                <div>
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Change your account password
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  Change Password
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-6">
                    <Button onClick={handleChangePassword} size="sm" className="px-4">
                      Update Password
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowChangePassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center gap-2 text-gray-600">
              <IoTrashOutline className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Danger Zone</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!showDeleteConfirm ? (
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 shrink-0"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              </div>
            ) : (
              <div className="px-6 py-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    This action cannot be undone. Please enter your password to confirm.
                  </p>
                  <Input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-3"
                  />
                  <div className="flex items-center gap-3 mt-4">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 px-4"
                      onClick={handleDeleteAccount}
                    >
                      Confirm Delete
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                      }}
                      className="px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;