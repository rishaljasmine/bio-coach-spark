import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Brain, BookOpen, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page after a brief moment to show landing
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary shadow-glow mb-4 animate-pulse">
          <Brain className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome to BioCoach
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered biology learning companion. Master biology concepts through interactive lessons, practice questions, and personalized guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="pt-6 space-y-2">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold">Interactive Learning</h3>
              <p className="text-sm text-muted-foreground">
                Explore 13+ biology topics with detailed explanations and examples
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="pt-6 space-y-2">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold">Practice Questions</h3>
              <p className="text-sm text-muted-foreground">
                Test your knowledge with AI-generated practice questions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="pt-6 space-y-2">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold">Quick Doubts</h3>
              <p className="text-sm text-muted-foreground">
                Get instant clarification on any biology concept
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8">
          <Button size="lg" onClick={() => navigate("/auth")} className="shadow-glow">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
