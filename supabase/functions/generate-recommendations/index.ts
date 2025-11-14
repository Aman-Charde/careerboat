import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, attempts } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const avgScore = attempts.reduce((sum: number, a: any) => sum + Number(a.percentage), 0) / attempts.length;
    
    const prompt = `Analyze aptitude test results and recommend 3 careers. Average score: ${avgScore}%. Return recommendations with confidence scores (0-100), required skills array, salary range, and growth potential.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    const careers = [
      {
        user_id,
        career_title: "Software Developer",
        description: "Design and build applications using programming languages",
        confidence_score: Math.min(95, avgScore + 10),
        required_skills: ["JavaScript", "Python", "Problem Solving"],
        salary_range: "$70k - $150k",
        growth_potential: "High",
      },
      {
        user_id,
        career_title: "Data Analyst",
        description: "Analyze data to help organizations make informed decisions",
        confidence_score: Math.min(90, avgScore + 5),
        required_skills: ["SQL", "Excel", "Statistics"],
        salary_range: "$60k - $120k",
        growth_potential: "Very High",
      },
      {
        user_id,
        career_title: "Project Manager",
        description: "Lead teams and coordinate projects to successful completion",
        confidence_score: Math.min(85, avgScore),
        required_skills: ["Leadership", "Communication", "Planning"],
        salary_range: "$75k - $130k",
        growth_potential: "High",
      },
    ];

    await supabase.from("career_recommendations").insert(careers);

    const skillGaps = [
      { user_id, skill_name: "Advanced JavaScript", current_level: 5, required_level: 8, priority: "high" },
      { user_id, skill_name: "Cloud Computing", current_level: 3, required_level: 7, priority: "medium" },
    ];

    await supabase.from("skill_gaps").insert(skillGaps);

    const learningPaths = [
      {
        user_id,
        resource_title: "JavaScript Mastery Course",
        resource_type: "course",
        resource_url: "https://example.com",
        estimated_duration: "3 months",
        provider: "Udemy",
        difficulty: "intermediate",
      },
    ];

    await supabase.from("learning_paths").insert(learningPaths);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
