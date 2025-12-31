"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import illustration from "@/app/assets/illustration.webp";
import { useRouter, useSearchParams } from "next/navigation";
import { emailSignInAPI, emailSignUpAPI, googleSignInAPI } from "@/app/clientAPI/authAPI";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof loginSchema> & { name?: string };

export default function AuthPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const action = searchParams.get("action");
    const isRegister = action === "signup";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitSuccessful },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(isRegister ? registerSchema : loginSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
        },
    });
    
    // Reset form when switching modes
    useEffect(() => {
        console.log("isRegister", isRegister)
        if(isSubmitSuccessful) {
            reset();
        }
    }, [isRegister]);

    // Set default action to login if missing
    useEffect(() => {
        if (!action) {
            router.replace("/auth?action=login");
        }
    }, [action, router]);

    const setAction = (newAction: "login" | "signup") => {
        router.push(`/auth?action=${newAction}`);
    };

    const {mutateAsync: emailSignInMutation, isPending: emailSignInLoading} = useMutation({
        mutationFn: (data: FormData) => emailSignInAPI(data.email, data.password),
        onSuccess: () => {
            router.replace("/");
        },
        onError: (error) => {
            toast.error(`Failed to sign in: ${error.message}`);
        }
    })

    const {mutateAsync: emailSignUpMutation, isPending: emailSignUpLoading} = useMutation({
        mutationFn: (data: FormData) => emailSignUpAPI(data.email, data.password, data.name || ""),
        onSuccess: () => {
            router.replace("/");
        },
        onError: (error) => {
            toast.error(`Failed to sign up: ${error.message}`);
        }
    })

    const {mutateAsync: googleSignInMutation, isPending: googleSignInLoading} = useMutation({
        mutationFn: () => googleSignInAPI(),
        onSuccess: () => {
            router.replace("/");
        },
        onError: (error) => {
            toast.error(`Failed to sign in with Google: ${error.message}`);
        }
    })

    const handleGoogleLogin = async () => {
        await googleSignInMutation();
    };

    const onSubmit = (data: FormData) => {
        console.log("data", data)
        if (isRegister) {
            emailSignUpMutation(data);
        } else {
            emailSignInMutation(data);
        }
    }

    return (
        <div className="flex h-screen w-full">
            {/* Left Side - Form */}
            <div className="flex w-full lg:w-1/2 xl:w-1/3 flex-col justify-center px-8 lg:px-16 bg-background">
                <div className="mx-auto w-full max-w-sm space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {isRegister ? "Create an account" : "Welcome back to Kanban Board!"}
                        </h1>
                    </div>

                    <Button 
                        variant="outline" 
                        className="w-full rounded-full h-12 text-base font-medium border-2 hover:bg-muted"
                        onClick={handleGoogleLogin}
                    >
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                placeholder="hello@gmail.com" 
                                type="email"
                                className="h-11"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                        
                        {isRegister && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="John Doe" 
                                    type="text"
                                    className="h-11"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name.message}</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                placeholder="Your password" 
                                type="password" 
                                className="h-11"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        {!isRegister && (
                            <div className="flex justify-start">
                                <a href="#" className="text-sm font-medium text-primary hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        <Button 
                            className="w-full h-11 font-semibold text-md"
                            type="submit"
                            disabled={emailSignInLoading || emailSignUpLoading}
                        >
                            {emailSignInLoading || emailSignUpLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span>{isRegister ? "Creating account..." : "Signing in..."}</span>
                                </div>
                            ) : (
                                isRegister ? "Register" : "Login"
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        {isRegister ? (
                            <p>
                                Already have an account?{" "}
                                <button 
                                    onClick={() => setAction("login")}
                                    className="font-medium text-primary hover:underline"
                                    type="button"
                                >
                                    Login
                                </button>
                            </p>
                        ) : (
                            <p>
                                Don't have an account?{" "}
                                <button 
                                    onClick={() => setAction("signup")}
                                    className="font-medium text-primary hover:underline"
                                    type="button"
                                    >
                                    Register
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden md:flex lg:w-1/2 xl:w-2/3 bg-muted items-center justify-center p-10 relative overflow-hidden">
                <Image
                    src={illustration}
                    alt="Kanban Board Illustration"
                    className="object-contain max-w-full max-h-full"
                    priority
                />
            </div>
        </div>
    );
}