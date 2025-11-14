import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Brain, TrendingUp, BookOpen, Target, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  career_title: string;
  description: string;
  confidence_score: number;
  required_skills: string[];
  salary_range: string;
  growth_potential: string;
}

interface SkillGap {
  skill_name: string;
  current_level: number;
  required_level: number;
  priority: string;
}

interface LearningPath {
  resource_title: string;
  resource_type: string;
  resource_url: string;
  estimated_duration: string;
  provider: string;
  difficulty: string;
}

const Recommendations = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    const { data: recsData } = await supabase
      .from("career_recommendations")
      .select("*")
      .eq("user_id", user?.id)
      .order("confidence_score", { ascending: false });

    const { data: gapsData } = await supabase
      .from("skill_gaps")
      .select("*")
      .eq("user_id", user?.id)
      .order("priority");

    const { data: pathsData } = await supabase
      .from("learning_paths")
      .select("*")
      .eq("user_id", user?.id);

    if (recsData) setRecommendations(recsData as any);
    if (gapsData) setSkillGaps(gapsData);
    if (pathsData) setLearningPaths(pathsData);

    setLoadingData(false);

    if (!recsData || recsData.length === 0) {
      generateRecommendations();
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);

    const { data: attempts } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("user_id", user?.id);

    if (!attempts || attempts.length < 2) {
      toast({
        title: "Not Enough Data",
        description: "Please complete at least 2 tests first",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-recommendations", {
        body: { user_id: user?.id, attempts },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Career recommendations generated",
      });

      loadRecommendations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loadingData || generating) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {generating ? "Generating Your Career Matches..." : "Loading..."}
          </h2>
          <p className="text-muted-foreground">
            Our AI is analyzing your test results to find the perfect career paths
          </p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Brain className="h-10 w-10 text-primary" />
            Your Career Recommendations
          </h1>
          <p className="text-muted-foreground">
            AI-powered career matches based on your aptitude test results
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Top Career Matches</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{rec.career_title}</CardTitle>
                      <Badge variant={Number(rec.confidence_score) > 80 ? "default" : "secondary"}>
                        {rec.confidence_score}% Match
                      </Badge>
                    </div>
                    <Progress value={Number(rec.confidence_score)} className="h-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{rec.description}</p>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {rec.required_skills?.map((skill, i) => (
                          <Badge key={i} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {rec.salary_range && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">Salary Range:</span>
                        <span className="text-muted-foreground">{rec.salary_range}</span>
                      </div>
                    )}

                    {rec.growth_potential && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="font-semibold">Growth:</span>
                        <span className="text-muted-foreground">{rec.growth_potential}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {skillGaps.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6" />
                Skill Gap Analysis
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {skillGaps.map((gap, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{gap.skill_name}</span>
                          <Badge variant="outline" className={getPriorityColor(gap.priority)}>
                            {gap.priority} priority
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground mb-1">
                              Current: {gap.current_level}/10
                            </div>
                            <Progress value={gap.current_level * 10} />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground mb-1">
                              Required: {gap.required_level}/10
                            </div>
                            <Progress value={gap.required_level * 10} className="bg-muted" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {learningPaths.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Recommended Learning Paths
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {learningPaths.map((path, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{path.resource_title}</CardTitle>
                      <CardDescription className="flex gap-2">
                        <Badge variant="outline">{path.resource_type}</Badge>
                        <Badge variant="secondary">{path.difficulty}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {path.provider && (
                        <div className="text-sm">
                          <span className="font-semibold">Provider: </span>
                          <span className="text-muted-foreground">{path.provider}</span>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-semibold">Duration: </span>
                        <span className="text-muted-foreground">{path.estimated_duration}</span>
                      </div>
                      {path.resource_url && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={path.resource_url} target="_blank" rel="noopener noreferrer">
                            View Resource
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
