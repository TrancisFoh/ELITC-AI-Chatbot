import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { UserPlus, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function UserManager() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await dbService.registerUser(username, password, 'admin');
      setSuccess(`User '${username}' registered successfully!`);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to register user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">Register New Admin</h3>
              <p className="text-sm text-zinc-500 font-medium mt-1">Create accounts for other staff members to access this portal.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., john.doe"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-elitc-gold/20 focus:border-elitc-gold outline-none transition-all font-medium text-zinc-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-elitc-gold/20 focus:border-elitc-gold outline-none transition-all font-medium text-zinc-900"
              required
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {success}
            </motion.div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-zinc-900/10 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Admin User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
