"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import illustration from "@/app/assets/illustration.webp";
import { useRouter, useSearchParams } from "next/navigation";
import { emailSignInAPI, emailSignUpAPI, githubSignInAPI } from "@/app/clientAPI/authAPI";

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
            router.replace("/dashboard");
        },
        onError: (error) => {
            toast.error(`Failed to sign in: ${error.message}`);
        }
    })

    const {mutateAsync: emailSignUpMutation, isPending: emailSignUpLoading} = useMutation({
        mutationFn: (data: FormData) => emailSignUpAPI(data.email, data.password, data.name || ""),
        onSuccess: () => {
            router.replace("/dashboard");
        },
        onError: (error) => {
            toast.error(`Failed to sign up: ${error.message}`);
        }
    })

    const {mutateAsync: githubSignInMutation, isPending: githubSignInLoading} = useMutation({
        mutationFn: () => githubSignInAPI(),
        onSuccess: () => {
            router.replace("/dashboard");
        },
        onError: (error) => {
            toast.error(`Failed to sign in with Google: ${error.message}`);
        }
    })

    const handleGithubLogin = async () => {
        await githubSignInMutation();
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
                        onClick={handleGithubLogin}
                    >
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                            />
                        </svg>
                        Github
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