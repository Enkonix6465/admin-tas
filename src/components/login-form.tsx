import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const taskQuotations = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The way to get started is to quit talking and begin doing.",
  "Don't be afraid to give up the good to go for the great.",
  "Innovation distinguishes between a leader and a follower.",
  "The only impossible journey is the one you never begin.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Everything you've ever wanted is on the other side of fear.",
  "Believe you can and you're halfway there.",
  "The future depends on what you do today.",
  "A goal without a plan is just a wish.",
];

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const randomQuote = taskQuotations[Math.floor(Math.random() * taskQuotations.length)];
    setCurrentQuote(randomQuote);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim().toLowerCase() !== "ceo@enkonix.in") {
      toast.error("Unauthorized email access");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success("Successfully logged in!");
      navigate("/");
    } catch (err) {
      toast.error("Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login coming soon!`);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-2xl border-0 bg-white dark:bg-gray-900 backdrop-blur-xl">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[600px]">
          {/* Left Side - Login Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-gray-900">
            <div className="max-w-sm mx-auto w-full space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  LOGIN
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Find out what's the admin's business management app
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Username
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ceo@enkonix.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    "SIGN IN"
                  )}
                </Button>
              </form>

              {/* Social Login */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                      Login with Others
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin("Google")}
                    className="h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm">Google</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin("Facebook")}
                    className="h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm">Facebook</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="relative hidden md:block bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute top-20 right-8 w-8 h-8 bg-white rounded-full"></div>
              <div className="absolute bottom-20 left-8 w-16 h-16 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-8 right-16 w-6 h-6 bg-white/30 rounded-full"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-white">
              {/* Illustration Area */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20">
                <img 
                  src="https://cdn.builder.io/api/v1/image/assets%2Ff1bd7ed4155e41139f488b41be79de93%2Febb8ad60fba64255918bc010827d591b?format=webp&width=800"
                  alt="Professional woman with tablet"
                  className="w-48 h-48 object-cover rounded-2xl"
                />
              </div>

              {/* Lightning Icon */}
              <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-6 h-6 text-yellow-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h7v8l10-12h-7V2z"/>
                </svg>
              </div>

              {/* Quote */}
              <div className="text-center space-y-4 max-w-xs">
                <p className="text-white/90 text-lg font-medium leading-relaxed">
                  "{currentQuote}"
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-1/4 left-8 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 right-12 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
            <div className="absolute bottom-1/3 left-12 w-4 h-4 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-gray-500 dark:text-gray-400 text-center text-sm">
        By continuing, you agree to our{" "}
        <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline underline-offset-4 transition-colors">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline underline-offset-4 transition-colors">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
