import type { Metadata } from 'next';
import LoginCard from '@/components/login-card';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Accepted! to save your practice and get scored feedback.',
};

export default function LoginPage() {
  return (
    <div className="workspace-page">
      <div className="panel mx-auto max-w-md p-6 sm:p-8">
        <LoginCard />
      </div>
    </div>
  );
}
