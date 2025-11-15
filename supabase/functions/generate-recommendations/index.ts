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

    // Fetch test details to understand categories
    const testIds = attempts.map((a: any) => a.test_id);
    const { data: tests } = await supabase
      .from("aptitude_tests")
      .select("id, title, category")
      .in("id", testIds);

    // Build detailed test performance summary
    const testPerformance = attempts.map((a: any) => {
      const test = tests?.find((t) => t.id === a.test_id);
      return `${test?.title} (${test?.category}): ${a.percentage}%`;
    }).join(", ");

    const avgScore = attempts.reduce((sum: number, a: any) => sum + Number(a.percentage), 0) / attempts.length;
    
    const prompt = `Analyze these aptitude test results and recommend 5 diverse career paths:

Test Performance: ${testPerformance}
Average Score: ${avgScore}%

Based on the specific test categories and scores, suggest 5 different career paths that match the user's strengths. Vary recommendations based on which tests scored highest. Consider technical skills, analytical thinking, and soft skills performance.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "recommend_careers",
            description: "Return 5 career recommendations based on test results",
            parameters: {
              type: "object",
              properties: {
                careers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      career_title: { type: "string" },
                      description: { type: "string" },
                      confidence_score: { type: "number", minimum: 0, maximum: 100 },
                      required_skills: { type: "array", items: { type: "string" } },
                      salary_range: { type: "string" },
                      growth_potential: { type: "string", enum: ["Low", "Medium", "High", "Very High"] }
                    },
                    required: ["career_title", "description", "confidence_score", "required_skills", "salary_range", "growth_potential"]
                  },
                  minItems: 5,
                  maxItems: 5
                }
              },
              required: ["careers"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "recommend_careers" } }
      }),
    });

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    const careerData = JSON.parse(toolCall.function.arguments);

    const careers = careerData.careers.map((career: any) => ({
      user_id,
      ...career
    }));

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
