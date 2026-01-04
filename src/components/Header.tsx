import Link from 'next/link';
import { Rocket } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">VoteCast</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
