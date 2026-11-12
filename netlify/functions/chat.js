exports.handler = async (event) => {

    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle browser preflight
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: ""
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: "Invalid request method."
            })
        };
    }

    try {

        // Receive user message
        const data = JSON.parse(event.body || "{}");
        const message = data.message;

        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "No valid message received."
                })
            };
        }

        if (message.length > 4000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "Message exceeds maximum length."
                })
            };
        }

        // Retrieve secure API key
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error("AI configuration unavailable.");
        }

        // Connect to OpenAI
        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({

                    model: "gpt-5.5",

                    instructions: `
You are J.A.R.V.I.S.

Your full designation is BLACKBURN J.A.R.V.I.S.

PERSONALITY:
- Intelligent, analytical and observant.
- Calm, professional and articulate.
- Slightly witty when appropriate.
- Respectful without being overly formal.
- Address the user as sir when natural.

BEHAVIOR:
- Answer questions intelligently.
- Explain complicated subjects clearly.
- Assist with planning and organization.
- Help with creative projects and ideas.
- Provide useful suggestions.
- Maintain a sophisticated assistant personality.
- Never pretend to have access to systems
  or information that you do not possess.

IDENTITY:
You are the personal AI assistant of the
BLACKBURN interface.

Your purpose is to assist, inform and organize.
                    `,

                    input: message,

                    max_output_tokens: 800

                })
            }
        );

        const result = await response.json();

        if (!response.ok) {

            console.error(
                "OpenAI API error:",
                result.error?.message || response.status
            );

            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    error: "AI communication failure."
                })
            };

        }

        // Extract AI response
        const reply = (result.output || [])
            .flatMap(item => item.content || [])
            .filter(item => item.type === "output_text")
            .map(item => item.text)
            .join("\n");

        if (!reply) {
            throw new Error("Empty AI response.");
        }

        // Return response to JARVIS interface
        return {

            statusCode: 200,

            headers,

            body: JSON.stringify({

                reply: reply,

                system: "BLACKBURN J.A.R.V.I.S.",

                status: "OPERATIONAL",

                intelligence: "ACTIVE AI"

            })

        };

    } catch (error) {

        console.error("JARVIS ERROR:", error);

        return {

            statusCode: 500,

            headers,

            body: JSON.stringify({

                error: "Internal intelligence framework error."

            })

        };

    }

};
