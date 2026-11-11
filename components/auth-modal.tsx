'use client';

import { useAuth } from './auth-provider';
import AuthForm from './auth-form';
import Dialog from './dialog';

export default function AuthModal() {
  const { authOpen, closeAuth } = useAuth();
  return (
    <Dialog open={authOpen} onClose={closeAuth} title="Welcome to Accepted!">
      <p className="body-copy mb-6">A little practice. A clearer plan. Your next chapter starts here.</p>
      <AuthForm />
    </Dialog>
  );
}
