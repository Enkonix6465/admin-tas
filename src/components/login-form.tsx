import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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
      <Card className="overflow-hidden p-0 shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative">
        {/* Floating glass icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-8 w-8 h-8 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-float">
            <svg className="w-4 h-4 text-purple-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="absolute top-40 left-20 w-6 h-6 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-float-delay-1">
            <svg className="w-3 h-3 text-indigo-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute bottom-32 left-12 w-7 h-7 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-float-delay-2">
            <svg className="w-3.5 h-3.5 text-pink-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="absolute top-60 left-4 w-5 h-5 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-float-delay-3">
            <svg className="w-2.5 h-2.5 text-blue-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <CardContent className="grid p-0 md:grid-cols-2 min-h-[600px]">
          {/* Left Side - Login Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl relative">
            {/* Background glass elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-16 right-8 w-12 h-12 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 dark:from-purple-800/20 dark:to-indigo-800/20 rounded-2xl backdrop-blur-sm animate-pulse"></div>
              <div className="absolute bottom-20 right-16 w-8 h-8 bg-gradient-to-br from-pink-200/20 to-purple-200/20 dark:from-pink-800/20 dark:to-purple-800/20 rounded-xl backdrop-blur-sm animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            <div className="max-w-sm mx-auto w-full space-y-8 relative z-10">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto transform rotate-3 hover:rotate-0 transition-all duration-500 backdrop-blur-sm border border-white/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-fade-in">
                  LOGIN
                </h1>
                <p className="text-gray-600 dark:text-gray-400 animate-slide-in">
                  Find out what's the admin's business management app
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-4 h-4 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      Username
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ceo@enkonix.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 px-4 rounded-xl border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/80"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-4 h-4 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 px-4 rounded-xl border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/80"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-medium shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0 backdrop-blur-sm"
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
                    <span className="w-full border-t border-gray-200/50 dark:border-gray-700/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 dark:bg-gray-900/80 px-2 text-gray-500 dark:text-gray-400 backdrop-blur-sm">
                      Login with Others
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin("Google")}
                    className="h-11 rounded-xl border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 hover:bg-white/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl"
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
                    className="h-11 rounded-xl border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 hover:bg-white/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl"
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

          {/* Right Side - Lottie Animation */}
          <div className="relative hidden md:block bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
            {/* Glass morphism background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-indigo-800/80 backdrop-blur-sm"></div>
            
            {/* Floating task management icons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-16 right-12 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl animate-float border border-white/20">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="absolute top-32 left-8 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-2xl animate-float-delay-1 border border-white/20">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute bottom-24 right-16 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl animate-float-delay-2 border border-white/20">
                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="absolute bottom-40 left-12 w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-2xl animate-float-delay-3 border border-white/20">
                <svg className="w-4.5 h-4.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="absolute top-48 right-8 w-7 h-7 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-2xl animate-float border border-white/20">
                <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-white">
              {/* Lottie Animation Container */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-500">
                <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-xl">
                  <DotLottieReact
                    src="https://lottie.host/f6c203e3-f55a-4f37-ae40-543cb7429268/Tw28xCsivC.lottie"
                    loop
                    autoplay
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Lightning Icon */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-2xl backdrop-blur-sm border border-white/20 animate-pulse">
                <svg className="w-6 h-6 text-yellow-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h7v8l10-12h-7V2z"/>
                </svg>
              </div>

              {/* Quote */}
              <div className="text-center space-y-4 max-w-xs">
                <p className="text-white/90 text-lg font-medium leading-relaxed backdrop-blur-sm">
                  "{currentQuote}"
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </div>
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
