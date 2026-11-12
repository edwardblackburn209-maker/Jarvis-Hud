exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

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
    const data = JSON.parse(event.body || "{}");
    const message = data.message;

    if (typeof message !== "string" || !message.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "No valid message received."
        })
      };
    }

    const reply =
      "Message received. Intelligence framework operational. " +
      "AI model connection pending. Your input: " +
      message.trim().slice(0, 2000);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply,
        system: "BLACKBURN J.A.R.V.I.S.",
        status: "OPERATIONAL",
        intelligence: "DEMO MODE"
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal intelligence framework error."
      })
    };
  }
};
