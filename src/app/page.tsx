
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Brush, Lightbulb, Users, CheckCircle, PencilRuler, Zap } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LottiePlayer from '@/components/lottie-player';
import animationData from '@/lib/animation-data.json';
import { cn } from '@/lib/utils';
import ScrollAnimator from '@/components/scroll-animator';


const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title:string, description: string }) => (
  <Card className="flex-1 min-w-[280px] bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
    <CardContent className="p-6 text-center">
      <div className="inline-block p-4 bg-primary/20 text-primary rounded-full mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold font-headline mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const HowItWorksStep = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
        <CardContent className="p-6 text-center">
             <div className="inline-block p-4 bg-primary/20 text-primary rounded-full mb-4">
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold font-headline">{title}</h3>
            <p className="text-muted-foreground mt-1">{description}</p>
        </CardContent>
    </Card>
);

const FloatingItem = ({ className, children, delay }: { className: string, children: React.ReactNode, delay: string }) => (
    <div className={cn("absolute hidden lg:block animate-fade-in-up filter grayscale", className)} style={{ animationDelay: delay }}>
        {children}
    </div>
);


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            
            <span className="font-bold text-xl font-headline">Dream Weaver</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/explore">Explore</Link>
            </Button>
            <Button asChild>
                <Link href="/login">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden bg-background">
            <div className="container max-w-7xl relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                <FloatingItem className="top-10 left-10 w-48 h-32" delay="0.8s">
                    <Image src="/images/followYourDreams.jpg" alt="Astronaut in space" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover rounded-lg shadow-2xl transform -rotate-6" data-ai-hint="design quote" />
                </FloatingItem>
                <FloatingItem className="top-24 right-1/4 w-40" delay="1s">
                    <Card className="p-4 bg-gray-300/80 backdrop-blur-sm shadow-xl transform rotate-3">
                        <p className="font-medium text-sm text-black">Brainstorm new ideas for the pitch deck!</p>
                    </Card>
                </FloatingItem>
                 <FloatingItem className="bottom-10 right-10 w-52 h-40" delay="1.2s">
                    <Image src="/images/designQuote.jpg" alt="Serene landscape" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover rounded-lg shadow-2xl transform rotate-2" data-ai-hint="serene landscape" />
                </FloatingItem>
                 <FloatingItem className="bottom-16 left-1/4" delay="1.4s">
                    <Badge variant="outline" className="shadow-lg text-base px-4 py-2 transform -rotate-12">#goals</Badge>
                </FloatingItem>

                <div className="max-w-4xl text-center mx-auto">
                    <Badge variant="outline" className="mb-4 animate-fade-in-up">Visualize. Collaborate. Manifest.</Badge>
                    <div className="flex justify-center animate-fade-in-up filter grayscale" style={{ animationDelay: '0.1s' }}>
                        <LottiePlayer animationData={animationData} className="h-52 w-52" />
                    </div>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-headline animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Weave Your Dreams into Reality
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    Dream Weaver is your personal canvas to visualize goals and a collaborative space to bring them to life. Turn your aspirations into actionable projects.
                    </p>
                    <div className="mt-10 flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <Button asChild size="lg">
                        <Link href="/login">Start Weaving Your Dream</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/explore">Explore Projects</Link>
                    </Button>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" className="py-16 md:py-24 bg-pastel-pink">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimator>
                <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline">Why Dream Weaver?</h2>
                <p className="text-muted-foreground mt-2">From personal vision boards to collaborative projects.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                <FeatureCard icon={Brush} title="Intuitive Canvas" description="Effortlessly drag and drop images, notes, and text to create your perfect vision board." />
                <FeatureCard icon={Lightbulb} title="Find Inspiration" description="Explore a universe of public projects, get inspired, and see what others are dreaming up." />
                <FeatureCard icon={Users} title="Collaborate & Connect" description="Share your vision and find partners with the skills you need to make your dream a reality." />
                </div>
            </ScrollAnimator>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24 bg-pastel-blue">
            <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollAnimator>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-headline">How It Works</h2>
                        <p className="text-muted-foreground mt-2">Bring your ideas to life in three simple steps.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                    <HowItWorksStep 
                            icon={PencilRuler} 
                            title="1. Create Your Canvas" 
                            description="Start with a blank canvas. This is your personal space to dream big and outline your goals."
                        />
                    <HowItWorksStep 
                            icon={Zap} 
                            title="2. Weave Your Vision" 
                            description="Add images, text, notes, and shapes. Arrange them freely to create a visual representation of your aspirations."
                        />
                    <HowItWorksStep 
                            icon={CheckCircle} 
                            title="3. Collaborate & Manifest" 
                            description="Share your board to find collaborators, gather feedback, and take the first steps toward making your dream a reality."
                        />
                    </div>
                </ScrollAnimator>
            </div>
        </section>
        
        <section id="faq" className="py-16 md:py-24 bg-pastel-green">
            <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollAnimator>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-headline">Frequently Asked Questions</h2>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Is Dream Weaver free to use?</AccordionTrigger>
                        <AccordionContent>
                        Yes, the core features of Dream Weaver—creating and managing your personal vision boards—are completely free. We may introduce premium features for teams and advanced collaboration in the future.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Can I share my vision boards with others?</AccordionTrigger>
                        <AccordionContent>
                        Absolutely! You can share your boards with specific people or make them public on the Explore page to find collaborators and partners for your projects.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>What kind of projects can I create?</AccordionTrigger>
                        <AccordionContent>
                        Anything you can dream of! From personal goals like fitness journeys and travel plans to large-scale projects like starting a business, launching a community initiative, or creating art.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>How is this different from other productivity tools?</AccordionTrigger>
                        <AccordionContent>
                        Dream Weaver focuses on the creative, visual-first stage of idea development. It's less about tasks and deadlines and more about inspiration, visualization, and finding the right people to bring your ideas to life.
                        </AccordionContent>
                    </AccordionItem>
                    </Accordion>
                </ScrollAnimator>
            </div>
        </section>

        <section className="py-16 md:py-24 bg-pastel-yellow">
            <div className="container max-w-5xl text-center mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollAnimator>
                    <h2 className="text-3xl font-bold font-headline mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-muted-foreground mb-8">Your next big idea is just a vision board away.</p>
                    <Button asChild size="lg">
                        <Link href="/login">
                            Create Your First Board for Free
                        </Link>
                    </Button>
                </ScrollAnimator>
            </div>
        </section>
      </main>

      <footer className="py-6 border-t bg-secondary">
        <div className="container mx-auto text-center text-muted-foreground text-sm px-4 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Dream Weaver. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
