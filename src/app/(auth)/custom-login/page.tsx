// components/DualLoginForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DualLoginForm() {
  // State for form selection
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');
  
  // States for email login
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  
  // States for username login
  const [username, setUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [role, setRole] = useState('USER');
  
  // Shared states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use NextAuth's built-in signIn for email login
      const result = await signIn('credentials-email', {
        email,
        password: emailPassword,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url?.includes('verify-request')) {
        router.push('/verify-request');
      } else {
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Method 1: Use our custom API endpoint
      const response = await fetch('/api/auth/custom-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password: usernamePassword, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Method 2 (Alternative): Use NextAuth's built-in signIn with our custom provider
      /*
      const result = await signIn('credentials-username', {
        username,
        password: usernamePassword,
        role,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      */

      router.refresh();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      {/* Toggle between login methods */}
      <div className="flex mb-6 border-b">
        <button
          className={`py-2 px-4 w-1/2 text-center ${loginMethod === 'email' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setLoginMethod('email')}
          type="button"
        >
          Email Login
        </button>
        <button
          className={`py-2 px-4 w-1/2 text-center ${loginMethod === 'username' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setLoginMethod('username')}
          type="button"
        >
          Username Login
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loginMethod === 'email' ? (
        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emailPassword">
              Password
            </label>
            <input
              id="emailPassword"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login with Email'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleUsernameLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usernamePassword">
              Password
            </label>
            <input
              id="usernamePassword"
              type="password"
              value={usernamePassword}
              onChange={(e) => setUsernamePassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="USER">User</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              {/* Add other roles as needed */}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login with Username'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}