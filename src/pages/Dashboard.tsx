import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Brain, ClipboardList, TrendingUp, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  total_questions: number;
}

interface TestAttempt {
  id: string;
  test_id: string;
  percentage: number;
  completed_at: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const { data: testsData } = await supabase
      .from("aptitude_tests")
      .select("*")
      .order("category");

    const { data: attemptsData } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("user_id", user?.id)
      .order("completed_at", { ascending: false });

    if (testsData) setTests(testsData);
    if (attemptsData) setAttempts(attemptsData);
    setLoadingData(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return <Brain className="h-6 w-6 text-primary" />;
      case "analytical":
        return <TrendingUp className="h-6 w-6 text-accent" />;
      case "soft_skills":
        return <BookOpen className="h-6 w-6 text-success" />;
      default:
        return <ClipboardList className="h-6 w-6" />;
    }
  };

  const getAttemptForTest = (testId: string) => {
    return attempts.find((a) => a.test_id === testId);
  };

  if (loading || loadingData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground">
            Continue your journey to discover the perfect career path
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attempts.length}</div>
              <p className="text-xs text-muted-foreground">out of {tests.length} available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attempts.length > 0
                  ? Math.round(
                      attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / attempts.length
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">across all tests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Career Matches</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attempts.length >= 2 ? "Ready" : "Pending"}
              </div>
              <p className="text-xs text-muted-foreground">
                {attempts.length >= 2
                  ? "View your recommendations"
                  : `Complete ${2 - attempts.length} more test(s)`}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Available Aptitude Tests</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => {
                const attempt = getAttemptForTest(test.id);
                return (
                  <Card key={test.id} className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        {getCategoryIcon(test.category)}
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                      </div>
                      <CardDescription>{test.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{test.total_questions} questions</span>
                        <span>{test.duration_minutes} minutes</span>
                      </div>
                      {attempt && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Last Score:</span>
                            <span className="font-semibold">{attempt.percentage}%</span>
                          </div>
                          <Progress value={Number(attempt.percentage)} />
                        </div>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/test/${test.id}`)}
                        variant={attempt ? "outline" : "default"}
                      >
                        {attempt ? "Retake Test" : "Start Test"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {attempts.length >= 2 && (
            <Card className="shadow-[var(--shadow-elevated)]" style={{ background: "var(--gradient-hero)" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  AI Career Recommendations
                </CardTitle>
                <CardDescription>
                  You've completed enough tests to receive personalized career guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/recommendations")} size="lg">
                  View Your Career Matches
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
