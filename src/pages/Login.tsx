import { LoginForm } from "../components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/40 dark:to-indigo-900 flex items-center justify-center p-4 md:p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/25 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-indigo-300/20 dark:bg-indigo-500/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-300/20 dark:bg-pink-500/25 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-300/20 dark:bg-yellow-500/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-green-300/20 dark:bg-green-500/20 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-5xl">
        <LoginForm />
      </div>
    </div>
  );
}
