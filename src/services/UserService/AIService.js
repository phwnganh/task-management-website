const GEMINI_API_KEY = "AIzaSyDYrLlLiFKCdRscn5-bxbgqE77GBRIY8I0";
// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
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

export const validateCommentWithAI = async (taskTitle = '', taskDescription = '', commentContent = '') => {
  const prompt = `
    You are a strict project management assistant. Your primary goal is to keep the comment section of a task focused and productive. You must reject comments that are not helpful or relevant.

    Analyze the new comment based on the task's title and description.
    
    A helpful comment provides a status update, asks a specific question about the task, or gives a suggestion to move the task forward.
    A bad comment is one that is too short (like "Done" or "Ok"), off-topic, or purely social.

    Here are some examples:
    
    --- Example 1 ---
    Task Title: "Implement Login Page UI"
    Task Description: "Create the user interface for the login page using Ant Design components."
    New Comment: "I've finished the basic layout with the username and password fields. I have a question about the 'Forgot Password' link - should it open a modal or navigate to a new page?"
    Your JSON Response:
    {
      "isValid": true,
      "feedback": "This is a relevant progress update and a specific, clarifying question."
    }
    
    --- Example 2 ---
    Task Title: "Refactor Database Schema"
    Task Description: "Optimize the database tables for better performance."
    New Comment: "Done."
    Your JSON Response:
    {
      "isValid": false,
      "feedback": "This comment is not helpful. Please provide details on what was done or what the next steps are."
    }
    
    --- Example 3 ---
    Task Title: "Deploy to Staging Server"
    Task Description: "Push the latest build to the staging environment for QA testing."
    New Comment: "Does anyone want to get lunch this afternoon?"
    Your JSON Response:
    {
      "isValid": false,
      "feedback": "This comment is off-topic and not related to the task."
    }

    --- Task to Analyze ---
    Task Title: "${taskTitle}"
    Task Description: "${taskDescription}"
    New Comment: "${commentContent}"
    Your JSON Response:
  `;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }, // Lower temperature for more deterministic, less "creative" responses
      }),
    });

    if (!response.ok) {
      console.error("AI validation API error:", response.status, await response.text());
      return { isValid: false, feedback: 'AI validation service returned an error.' };
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid AI response structure:", data);
      return { isValid: false, feedback: 'Received an invalid response structure from AI.' };
    }

    const aiResponseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);

    if (jsonMatch?.[0]) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.error("Could not parse JSON from AI response:", aiResponseText);
      return { isValid: false, feedback: 'Could not parse AI validation response.' };
    }
  } catch (error) {
    console.error("Error during AI validation fetch call:", error);
    return { isValid: false, feedback: 'An error occurred while contacting the AI validation service.' };
  }
};