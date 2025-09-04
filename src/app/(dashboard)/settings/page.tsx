"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings, Settings } from '@/hooks/useSettings';
import Notification, { NotificationType } from '@/components/Notification';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const {
    settings,
    loading,
    updateProfile,
    updateAccountPreferences,
    updateNotificationSettings,
    updatePassword
  } = useSettings();

  // Form states
  const [formData, setFormData] = useState<{
    profile: {
      fullName: string;
      phoneNumber: string;
    };
    account: {
      theme: 'system' | 'light' | 'dark';
      currency: string;
    };
    notifications: {
      emailNotifications: boolean;
      lowBalanceAlerts: boolean;
      largeTransactionAlerts: boolean;
    };
    security: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    };
  }>({
    profile: {
      fullName: settings.profile.fullName,
      phoneNumber: settings.profile.phoneNumber
    },
    account: {
      theme: settings.account.theme,
      currency: settings.account.currency
    },
    notifications: {
      emailNotifications: settings.notifications.emailNotifications,
      lowBalanceAlerts: settings.notifications.lowBalanceAlerts,
      largeTransactionAlerts: settings.notifications.largeTransactionAlerts
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Update form data when settings are loaded
  useState(() => {
    if (!loading) {
      setFormData({
        profile: {
          fullName: settings.profile.fullName,
          phoneNumber: settings.profile.phoneNumber
        },
        account: {
          theme: settings.account.theme,
          currency: settings.account.currency
        },
        notifications: {
          emailNotifications: settings.notifications.emailNotifications,
          lowBalanceAlerts: settings.notifications.lowBalanceAlerts,
          largeTransactionAlerts: settings.notifications.largeTransactionAlerts
        },
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      });
    }
  });

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: NotificationType;
    message: string;
  }>({
    show: false,
    type: 'info',
    message: ''
  });

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({
      show: true,
      type,
      message
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Input change handlers
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: value
      }
    }));
  };

  const handleAccountChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      account: {
        ...prev.account,
        [name]: value
      }
    }));
  };

  const handleNotificationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked
      }
    }));
  };

  const handleSecurityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: value
      }
    }));
  };

  // Form submission handlers
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { success, error } = await updateProfile({
        fullName: formData.profile.fullName,
        phoneNumber: formData.profile.phoneNumber
      });
      
      if (success) {
        showNotification('success', 'Profile updated successfully');
      } else {
        showNotification('error', error || 'Failed to update profile');
      }
    } catch (error: any) {
      showNotification('error', error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { success, error } = await updateAccountPreferences({
        theme: formData.account.theme,
        currency: formData.account.currency
      });
      
      if (success) {
        showNotification('success', 'Account preferences updated successfully');
      } else {
        showNotification('error', error || 'Failed to update account preferences');
      }
    } catch (error: any) {
      showNotification('error', error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { success, error } = await updateNotificationSettings({
        emailNotifications: formData.notifications.emailNotifications,
        lowBalanceAlerts: formData.notifications.lowBalanceAlerts,
        largeTransactionAlerts: formData.notifications.largeTransactionAlerts
      });
      
      if (success) {
        showNotification('success', 'Notification settings updated successfully');
      } else {
        showNotification('error', error || 'Failed to update notification settings');
      }
    } catch (error: any) {
      showNotification('error', error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { success, error } = await updatePassword({
        currentPassword: formData.security.currentPassword,
        newPassword: formData.security.newPassword,
        confirmPassword: formData.security.confirmPassword
      });
      
      if (success) {
        showNotification('success', 'Password updated successfully');
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          security: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));
      } else {
        showNotification('error', error || 'Failed to update password');
      }
    } catch (error: any) {
      showNotification('error', error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === 'account'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
          </li>
          <li>
            <button
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </li>
        </ul>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Profile Information</h2>
              
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={formData.profile.fullName}
                      onChange={handleProfileChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                      value={user?.email || ''}
                      readOnly
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Your email address cannot be changed.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={formData.profile.phoneNumber}
                      onChange={handleProfileChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                      placeholder="+254 700 000000"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Account Tab Content */}
          {activeTab === 'account' && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Account Preferences</h2>
              
              <form onSubmit={handleAccountSubmit}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Theme Preferences</h3>
                    <div className="mt-3">
                      <div className="flex items-center space-x-2">
                        <input
                          id="theme-system"
                          name="theme"
                          type="radio"
                          checked={formData.account.theme === 'system'}
                          onChange={() => handleAccountChange('theme', 'system')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label htmlFor="theme-system" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          System Default
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          id="theme-light"
                          name="theme"
                          type="radio"
                          checked={formData.account.theme === 'light'}
                          onChange={() => handleAccountChange('theme', 'light')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label htmlFor="theme-light" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Light Mode
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          id="theme-dark"
                          name="theme"
                          type="radio"
                          checked={formData.account.theme === 'dark'}
                          onChange={() => handleAccountChange('theme', 'dark')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label htmlFor="theme-dark" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dark Mode
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Currency Display</h3>
                    <div className="mt-3">
                      <select
                        id="currency"
                        name="currency"
                        aria-label="Select display currency"
                        value={formData.account.currency}
                        onChange={(e) => handleAccountChange('currency', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 dark:text-white dark:bg-gray-700"
                      >
                        <option value="KES">Kenyan Shilling (KES)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">British Pound (GBP)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Notifications Tab Content */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Notification Settings</h2>
              
              <form onSubmit={handleNotificationsSubmit}>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="emailNotifications"
                        name="emailNotifications"
                        type="checkbox"
                        checked={formData.notifications.emailNotifications}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="emailNotifications" className="font-medium text-gray-700 dark:text-gray-300">Email notifications</label>
                      <p className="text-gray-500 dark:text-gray-400">Receive emails about account activity and balance updates.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="lowBalanceAlerts"
                        name="lowBalanceAlerts"
                        type="checkbox"
                        checked={formData.notifications.lowBalanceAlerts}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="lowBalanceAlerts" className="font-medium text-gray-700 dark:text-gray-300">Low balance alerts</label>
                      <p className="text-gray-500 dark:text-gray-400">Get notified when your account balance falls below a threshold.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="largeTransactionAlerts"
                        name="largeTransactionAlerts"
                        type="checkbox"
                        checked={formData.notifications.largeTransactionAlerts}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="largeTransactionAlerts" className="font-medium text-gray-700 dark:text-gray-300">Large transaction alerts</label>
                      <p className="text-gray-500 dark:text-gray-400">Get notified of unusually large transactions on your accounts.</p>
                    </div>
                  </div>
                  
                  <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Notification Settings'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Security Tab Content */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Security Settings</h2>
              
              <form onSubmit={handleSecuritySubmit}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Change Password</h3>
                    <div className="mt-3 space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={formData.security.currentPassword}
                          onChange={handleSecurityChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={formData.security.newPassword}
                          onChange={handleSecurityChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.security.confirmPassword}
                          onChange={handleSecurityChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Notification */}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
}