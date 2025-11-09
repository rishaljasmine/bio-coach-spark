import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, topic, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine the intent from the message
    const lowerMessage = message.toLowerCase();
    let systemPrompt = "";

    if (lowerMessage.includes("explain") || lowerMessage.includes("what is") || lowerMessage.includes("tell me about")) {
      systemPrompt = `You are BioCoach, an expert biology tutor. The student is learning about "${topic}".
      
When explaining topics:
1. Start with a clear, simple explanation
2. Break down complex concepts into digestible parts
3. Use analogies and real-world examples
4. Keep explanations engaging and student-friendly
5. After explaining, ask 1-2 follow-up questions to check understanding

Format your response in a clear, structured way with proper paragraphs.`;
    } else if (lowerMessage.includes("doubt") || lowerMessage.includes("question") || lowerMessage.includes("confused")) {
      systemPrompt = `You are BioCoach, an expert biology tutor. The student is learning about "${topic}".
      
When answering doubts:
1. Provide a clear, concise answer (2-3 lines)
2. Address the specific confusion
3. Use simple language
4. If needed, provide a quick example

Keep answers brief but complete.`;
    } else if (lowerMessage.includes("practice") || lowerMessage.includes("questions") || lowerMessage.includes("quiz")) {
      if (lowerMessage.includes("answer") || lowerMessage.includes("solution")) {
        systemPrompt = `You are BioCoach, an expert biology tutor. The student is learning about "${topic}".
        
Provide answers to the practice questions that were previously asked. For each question:
1. State the question number
2. Provide the correct answer
3. Give a brief explanation of why it's correct

Format clearly with question numbers.`;
      } else {
        systemPrompt = `You are BioCoach, an expert biology tutor. The student is learning about "${topic}".
        
Generate 5 practice questions about ${topic}:
1. Mix of difficulty levels (2 easy, 2 medium, 1 challenging)
2. Include multiple choice and short answer questions
3. Questions should test understanding, not just memorization
4. Number each question clearly
5. DO NOT provide answers yet - only questions

Tell the student they can ask for answers when ready.`;
      }
    } else {
      systemPrompt = `You are BioCoach, an expert biology tutor. The student is learning about "${topic}".
      
You help students learn biology through:
- Clear explanations with examples
- Quick doubt clarification (2-3 lines)
- Practice question generation
- Follow-up questions to ensure understanding
- Topic summaries

Be encouraging, patient, and make learning fun!`;
    }

    // Generate image if explaining
    let imageUrl = null;
    if (lowerMessage.includes("explain") || lowerMessage.includes("what is") || lowerMessage.includes("tell me about")) {
      try {
        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              {
                role: "user",
                content: `Generate an educational diagram or illustration for: ${topic}. Make it clear, scientific, and suitable for biology students.`,
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        }
      } catch (error) {
        console.error("Image generation error:", error);
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    return new Response(
      JSON.stringify({ response: aiResponse, image: imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
