import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, LogOut, BookOpen, Microscope, Eye, Zap, Heart, Leaf, Globe, Droplets, Box } from "lucide-react";
import { toast } from "sonner";

const topics = [
  { id: "food-chain", name: "Food Chain", icon: Globe, description: "Energy flow in ecosystems" },
  { id: "digestive-system", name: "Digestive System", icon: BookOpen, description: "How we process food" },
  { id: "human-eyes", name: "Human Eyes", icon: Eye, description: "Vision and light perception" },
  { id: "nervous-system", name: "Nervous System", icon: Zap, description: "Communication in the body" },
  { id: "brain", name: "Brain", icon: Brain, description: "Control center of the body" },
  { id: "ecosystem", name: "Ecosystem", icon: Globe, description: "Interactions in nature" },
  { id: "chemical-reactions", name: "Chemical Reactions", icon: Microscope, description: "Reactions in the body" },
  { id: "human-heart", name: "Human Heart", icon: Heart, description: "Pumping blood through the body" },
  { id: "cells", name: "Cells", icon: Box, description: "Building blocks of life" },
  { id: "photosynthesis", name: "Photosynthesis", icon: Leaf, description: "How plants make food" },
  { id: "transpiration", name: "Transpiration", icon: Droplets, description: "Water movement in plants" },
  { id: "plant-cell", name: "Plant Cell", icon: Leaf, description: "Structure of plant cells" },
  { id: "animal-cell", name: "Animal Cell", icon: Box, description: "Structure of animal cells" },
];

const Topics = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleTopicClick = (topicId: string, topicName: string) => {
    navigate(`/chat?topic=${topicId}&name=${encodeURIComponent(topicName)}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BioCoach
              </h1>
              <p className="text-sm text-muted-foreground">Choose a topic to explore</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Card
                key={topic.id}
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-card bg-gradient-card border-border/50 group"
                onClick={() => handleTopicClick(topic.id, topic.name)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{topic.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {topic.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Topics;
