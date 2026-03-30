import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert freelance proposal writer. Generate a professional, compelling freelance proposal based on the information provided.

The proposal should include these sections:
1. **Introduction** - A warm, confident opening that addresses the client by name and shows understanding of their needs
2. **Scope of Work** - Clear bullet points of exactly what will be delivered
3. **Timeline** - A realistic breakdown of milestones
4. **Investment** - The price presented professionally with what it includes
5. **Why Me** - 2-3 sentences on why the freelancer is the right choice (infer from their service type)
6. **Next Steps** - A clear call to action to move forward

Tone: Professional but personable. Confident but not arrogant. Write in first person from the freelancer's perspective.

Return ONLY the proposal text with markdown formatting. No preamble, no explanation, just the proposal.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { yourName, service, clientName, projectDescription, price, timeline } = body;

    const userMessage = `Generate a freelance proposal with these details:
- Freelancer name/business: ${yourName}
- Service being offered: ${service}
- Client name: ${clientName}
- Project description: ${projectDescription}
- Price: ${price}
- Timeline: ${timeline}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((b: { type: string; text?: string }) => b.text || "").join("") || "";

    if (!text) {
      return NextResponse.json({ error: "No proposal generated" }, { status: 500 });
    }

    return NextResponse.json({ proposal: text });
  } catch (error) {
    console.error("Proposal generation error:", error);
    return NextResponse.json({ error: "Failed to generate proposal" }, { status: 500 });
  }
}