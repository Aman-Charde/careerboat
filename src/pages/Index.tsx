import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Brain, Target, TrendingUp, BookOpen, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-20 px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <Brain className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Your Ideal Career Path
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered aptitude tests and personalized recommendations to guide you toward 
            a fulfilling career that matches your unique skills and aspirations.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Take Aptitude Tests</h3>
              <p className="text-muted-foreground">
                Complete comprehensive tests covering technical, analytical, and soft skills
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-accent/10">
                  <Brain className="h-8 w-8 text-accent" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Get AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your results to identify strengths and career matches
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-success/10">
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Receive Guidance</h3>
              <p className="text-muted-foreground">
                Get personalized career recommendations and learning paths
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Features That Set You Up for Success
              </h2>
              <div className="space-y-4">
                {[
                  "Comprehensive aptitude assessments",
                  "AI-powered career matching",
                  "Skill gap analysis",
                  "Personalized learning paths",
                  "Confidence scores for each recommendation",
                  "Growth potential insights",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-card shadow-[var(--shadow-card)]">
                <BookOpen className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">Smart Learning Paths</h3>
                <p className="text-muted-foreground">
                  Receive curated learning resources tailored to bridge your skill gaps
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-card shadow-[var(--shadow-card)]">
                <Target className="h-8 w-8 text-accent mb-3" />
                <h3 className="text-xl font-semibold mb-2">Career Matching</h3>
                <p className="text-muted-foreground">
                  Advanced AI algorithms match you with careers that fit your profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Path?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of professionals who've discovered their ideal career with CareerPath AI
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-12">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
