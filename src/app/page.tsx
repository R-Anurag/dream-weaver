import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Brush, Lightbulb, Users } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brush className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl font-headline">Dream Weaver</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/explore">Explore</Link>
            </Button>
            <Button asChild>
              <Link href="/boards">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden">
           <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
          <div className="container max-w-4xl text-center relative z-10">
            <Badge variant="outline" className="mb-4 bg-background/50 border-primary/50 text-primary animate-fade-in-up">Visualize. Collaborate. Manifest.</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-headline animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Weave Your Dreams into Reality
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Dream Weaver is your personal canvas to visualize goals and a collaborative space to bring them to life. Turn your aspirations into actionable projects.
            </p>
            <div className="mt-10 flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Button asChild size="lg">
                <Link href="/boards">Start Weaving Your Dream</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/explore">Explore Projects</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline">A New Way to Achieve Your Goals</h2>
              <p className="text-muted-foreground mt-2">From personal vision boards to collaborative projects.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <FeatureCard icon={Brush} title="Intuitive Canvas" description="Effortlessly drag and drop images, notes, and text to create your perfect vision board." />
              <FeatureCard icon={Lightbulb} title="Find Inspiration" description="Explore a universe of public projects, get inspired, and see what others are dreaming up." />
              <FeatureCard icon={Users} title="Collaborate & Connect" description="Share your vision and find partners with the skills you need to make your dream a reality." />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
            <div className="container max-w-5xl text-center">
                 <h2 className="text-3xl font-bold font-headline mb-4">Ready to Start Your Journey?</h2>
                 <p className="text-muted-foreground mb-8">Your next big idea is just a vision board away.</p>
                 <Button asChild size="lg">
                    <Link href="/boards">
                        Create Your First Board for Free
                    </Link>
                </Button>
            </div>
        </section>
      </main>

      <footer className="py-6 border-t bg-secondary">
        <div className="container text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Dream Weaver. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
