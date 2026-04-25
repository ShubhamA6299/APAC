import https from 'https';
import { getUserMemory, updateProgress } from './memory.js';

// [Google Services usage] Using Google Cloud's generative AI (Gemini) via native REST API
function generateContentRest(apiKey, context, userMessage) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [{
        parts: [{ text: context + "\\n\\nUser Message: " + userMessage }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/gemini-2.5-flash:generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            const text = json.candidates[0].content.parts[0].text;
            resolve(text);
          } catch (e) {
            reject(new Error("Failed to parse Gemini response: " + data));
          }
        } else {
          reject(new Error(`Gemini API Error (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

export async function handleChat(sessionId, message) {
  const memory = getUserMemory(sessionId);
  const context = `You are a learning companion. Your goal is to adapt your teaching pace and style.
User's learning progress: ${JSON.stringify(memory.progress)}
The user is currently studying: ${memory.currentTopic || 'General topics'}.
If the user struggles, provide simpler explanations. If they understand, move to advanced topics or give a quiz.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      // Fallback response for testing locally without a key
      return { 
        response: `[Mocked Agent] Please set GEMINI_API_KEY in .env to connect to Google AI. Here is a simplified explanation for: ${message}.`,
        progress: memory.progress 
      };
    }

    const responseText = await generateContentRest(apiKey, context, message);
    
    // In a real scenario, the agent would use tools to update user progress.
    // For simplicity, we are just generating a text response here.
    return { response: responseText, progress: memory.progress };
  } catch (error) {
    console.error("Agent error:", error);
    return { 
      response: `[Fallback Response] I'm sorry, I couldn't process that right now. (Error: ${error.message})`,
      progress: memory.progress 
    };
  }
}
