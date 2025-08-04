import { LoginForm } from "../components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center p-4 md:p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-5xl">
        <LoginForm />
      </div>
    </div>
  );
}
