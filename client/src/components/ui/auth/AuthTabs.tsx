import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmailVerificationTab } from './EmailVerificationTab';
import { PhoneVerificationTab } from './PhoneVerificationTab';

type AuthMethod = 'email' | 'phone';

interface AuthTabsProps {
  isSignUp?: boolean;
}

export function AuthTabs({ isSignUp = true }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'email'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📧 Email
        </button>
        <button
          onClick={() => setActiveTab('phone')}
          className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'phone'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📱 Téléphone
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'email' ? (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {email && password && (
              <EmailVerificationTab 
                email={email} 
                password={password} 
                isSignUp={isSignUp}
              />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="tel"
              placeholder="Numéro de téléphone (+33...)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {phoneNumber && (
              <PhoneVerificationTab phoneNumber={phoneNumber} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}