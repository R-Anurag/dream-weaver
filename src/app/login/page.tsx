
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Brush } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-3.31 0-6.04-2.73-6.04-6.04s2.73-6.04 6.04-6.04c1.88 0 3.13.77 3.84 1.48l2.84-2.73C18.47 2.45 15.79 1 12.48 1 7.02 1 3 5.02 3 10.5S7.02 20 12.48 20c2.9 0 5.25-1.01 7.04-2.79 1.88-1.88 2.62-4.62 2.62-7.37 0-.54-.05-.99-.12-1.42H12.48z" />
    </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>GitHub</title>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Pinterest</title>
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.078 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.219-.938 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.911 2.168-2.911 1.026 0 1.512.775 1.512 1.692 0 1.025-.655 2.559-.998 3.982-.285 1.193.601 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.56-5.409 5.199 0 1.033.394 2.143.889 2.741.099.132.11.232.08.345l-.333 1.36c-.053.22-.174.267-.402.161-1.492-.695-2.424-2.875-2.424-4.627 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.627-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.623 0 11.983-5.367 11.983-12.013C24 5.367 18.64 0 12.017 0z" />
    </svg>
);


export default function LoginPage() {
    const { toast } = useToast();

    const handleLogin = (provider: string) => {
        toast({
            title: "Login Not Implemented",
            description: `Login with ${provider} will be available soon.`,
        });
    };

    return (
        <div className="flex min-h-svh items-center justify-center bg-grid-pattern p-4">
            <Card className="w-full max-w-md shadow-2xl animate-fade-in-up">
                <CardHeader className="text-center">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <Brush className="h-8 w-8 text-primary" />
                    </Link>
                    <CardTitle className="text-2xl font-bold font-headline">Welcome to Dream Weaver</CardTitle>
                    <CardDescription>Sign in to continue to your canvas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full h-12 text-base" onClick={() => handleLogin('Google')}>
                        <GoogleIcon className="mr-3 h-5 w-5" />
                        Sign in with Google
                    </Button>
                    <Button variant="outline" className="w-full h-12 text-base" onClick={() => handleLogin('GitHub')}>
                        <GithubIcon className="mr-3 h-5 w-5" />
                        Sign in with GitHub
                    </Button>
                     <Button variant="outline" className="w-full h-12 text-base" onClick={() => handleLogin('Pinterest')}>
                        <PinterestIcon className="mr-3 h-5 w-5 text-[#E60023]" />
                        Sign in with Pinterest
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

