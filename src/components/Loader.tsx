import { Loader as Loader2 } from 'lucide-react';

interface LoaderProps {
  className?: string;
  size?: number;
}

export function Loader({ className = '', size = 24 }: LoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin" size={size} />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader size={48} />
    </div>
  );
}
