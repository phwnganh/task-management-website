const GEMINI_API_KEY = "AIzaSyDYrLlLiFKCdRscn5-bxbgqE77GBRIY8I0";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export const getAITaskSuggestions = async (title, description, startDate) => {
  try {
    const prompt = `
    Analyze the following task information and provide suggestions for:
    1. Priority (Low, Medium, High) - based on urgency and importance
    2. Labels (roles like Developer, Tester, Designer, Data Analyst, PM, etc.) - based on task content
    3. Due Date - suggest a reasonable due date based on task complexity and start date

    Task Title: ${title}
    Task Description: ${description}
    Start Date: ${startDate}

    Please respond in JSON format only:
    {
      "priority": "Low|Medium|High",
      "labels": ["label1", "label2"],
      "dueDate": "YYYY-MM-DD"
    }

    Consider:
    - Priority: Urgent words like "urgent", "critical", "immediate" suggest High priority
    - Labels: Technical terms suggest Developer, testing terms suggest Tester, design terms suggest Designer
    - Due Date: Simple tasks 1-3 days, complex tasks 1-2 weeks, very complex tasks 2-4 weeks
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", response.status, errorText);
      
      // If API fails, return fallback suggestions based on simple logic
      console.log("Using fallback suggestions due to API error");
      return getFallbackSuggestions(title, description, startDate);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("Invalid API response structure:", data);
      return getFallbackSuggestions(title, description, startDate);
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    console.log("Raw AI Response:", aiResponse);
    
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", aiResponse);
      return getFallbackSuggestions(title, description, startDate);
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    console.log("Parsed suggestions:", suggestions);
    
    return {
      priority: suggestions.priority,
      labels: suggestions.labels || [],
      dueDate: suggestions.dueDate,
    };
  } catch (error) {
    console.error("AI suggestion error:", error);
    console.log("Using fallback suggestions due to error");
    return getFallbackSuggestions(title, description, startDate);
  }
};

// Fallback function that provides basic suggestions without AI
const getFallbackSuggestions = (title, description, startDate) => {
  const priority = determinePriority(title, description);
  const labels = determineLabels(title, description);
  let dueDate = undefined;
  if (startDate) {
    let days = 7;
    const text = (title + " " + description).toLowerCase();
    if (text.includes("simple") || text.includes("quick") || text.includes("minor")) {
      days = 2;
    } else if (text.includes("complex") || text.includes("major") || text.includes("refactor")) {
      days = 14;
    }
    const start = new Date(startDate);
    start.setDate(start.getDate() + days);
    dueDate = start.toISOString().split('T')[0];
  }
  return {
    priority,
    labels,
    dueDate,
  };
};

const determinePriority = (title, description) => {
  const text = (title + " " + description).toLowerCase();
  if (text.includes("urgent") || text.includes("critical") || text.includes("immediate") || text.includes("emergency")) {
    return "High";
  } else if (text.includes("important") || text.includes("deadline") || text.includes("asap")) {
    return "Medium";
  }
  return "Low";
};

const determineLabels = (title, description) => {
  const text = (title + " " + description).toLowerCase();
  const labels = [];
  
  if (text.includes("develop") || text.includes("code") || text.includes("program") || text.includes("bug") || text.includes("fix")) {
    labels.push("Developer");
  }
  if (text.includes("test") || text.includes("qa") || text.includes("quality")) {
    labels.push("Tester");
  }
  if (text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("interface")) {
    labels.push("Designer");
  }
  if (text.includes("data") || text.includes("analysis") || text.includes("analytics")) {
    labels.push("Data Analyst");
  }
  if (text.includes("manage") || text.includes("coordinate") || text.includes("plan")) {
    labels.push("PM");
  }
  
  return labels.length > 0 ? labels : ["Developer"];
}; 