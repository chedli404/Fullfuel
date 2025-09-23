import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';

const VerifyEmailPage = () => {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // Check if we have a token from URL params (from email link)
      const token = params.token;
      
      if (token) {
        try {
          // Call the API to verify the email
          const response = await fetch(`/api/auth/verify-email?token=${token}`);
          
          if (response.ok) {
            // API should redirect, but if it returns JSON, handle it
            const data = await response.json();
            if (data.token && data.user) {
              localStorage.setItem('auth_token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              setStatus('success');
              setMessage('Email verified! Logging you in...');
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
            }
          } else {
            setStatus('error');
            setMessage('Verification failed. Please try again.');
          }
        } catch (error) {
          console.error('Verification error:', error);
          setStatus('error');
          setMessage('Error verifying email. Please try again.');
        }
      } else {
        // Check for query parameters (from redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const statusParam = urlParams.get('status');
        const tokenParam = urlParams.get('token');
        const userParam = urlParams.get('user');

        if (statusParam === 'success' && tokenParam && userParam) {
          localStorage.setItem('auth_token', tokenParam);
          localStorage.setItem('user', decodeURIComponent(userParam));
          setStatus('success');
          setMessage('Email verified! Logging you in...');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else if (statusParam) {
          const msg = urlParams.get('message');
          setStatus(statusParam as any);
          setMessage(msg ? decodeURIComponent(msg) : 'Verification failed');
          setTimeout(() => {
            setLocation('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('No verification status found');
        }
      }
    };

    verifyEmail();
  }, [params.token, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          )}
          {status === 'success' && (
            <div className="text-green-500 text-5xl mb-4">✓</div>
          )}
          {status === 'error' && (
            <div className="text-red-500 text-5xl mb-4">✗</div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p className="text-gray-300 mb-6">{message}</p>

        {status === 'success' && (
          <p className="text-sm text-gray-400">
            Redirecting to home page in 2 seconds...
          </p>
        )}

        {status === 'error' && (
          <button
            onClick={() => setLocation('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
