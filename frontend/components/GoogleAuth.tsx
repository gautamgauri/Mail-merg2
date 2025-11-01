import React from 'react';
import { AuthState } from '../types';
import { LogoutIcon } from './icons';

interface GoogleAuthProps {
  auth: AuthState;
  onLogout: () => void;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ auth, onLogout }) => {
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-10">
      {auth.isLoggedIn && auth.userProfile ? (
        <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-full shadow-lg backdrop-blur-sm">
          <img src={auth.userProfile.picture} alt={auth.userProfile.name} className="w-8 h-8 rounded-full" />
          <span className="text-sm font-medium text-gray-300 hidden sm:inline">{auth.userProfile.name}</span>
          <button onClick={onLogout} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition" aria-label="Sign out">
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div id="google-signin-button"></div>
      )}
    </div>
  );
};
