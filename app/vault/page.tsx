import Vault from '@/components/vault';

export const metadata = {
  title: 'Program Vault',
  description:
    'Every Ontario university program requiring a supplemental application — competitive averages, formats, deadlines, and practice prompts.',
};

export default function VaultPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <Vault />
    </div>
  );
}
