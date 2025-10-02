import { ReactNode } from 'react';
import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Employee Management</h1>
            <p className="text-muted-foreground mt-2">Manage your workforce efficiently</p>
          </div>
          <div className="bg-card shadow-lg rounded-lg p-8 border">
            {children}
          </div>
        </motion.div>
      </div>
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white max-w-lg"
        >
          <h2 className="text-4xl font-bold mb-6">Welcome to the future of HR management</h2>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start">
              <span className="text-blue-200 mr-2">✓</span>
              <span>Track attendance and manage leaves effortlessly</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-200 mr-2">✓</span>
              <span>Generate comprehensive monthly reports</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-200 mr-2">✓</span>
              <span>Multi-tenant architecture for enterprise scale</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-200 mr-2">✓</span>
              <span>Secure role-based access control</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
