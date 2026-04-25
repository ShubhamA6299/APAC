import https from 'https';
import NodeCache from 'node-cache';
import { getUserMemory, updateProgress } from './memory.js';

// [Efficiency] Cache responses for 1 hour to reduce API latency and costs
const responseCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Uses the native HTTPS module to invoke Google Cloud's Gemini 2.5 Flash model via REST API.
 * This ensures compatibility across all Node versions without relying on the heavy SDK.
 * 
 * @param {string} apiKey - The Google Cloud API Key.
 * @param {string} context - The pedagogical context and prompt instructions.
 * @param {string} userMessage - The raw message input from the user.
 * @returns {Promise<string>} The generated AI text response.
 */
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

/**
 * Main handler for chat messages. Integrates memory state and Google AI generation.
 * Adjusts teaching pace based on the user's progress.
 * 
 * @param {string} sessionId - The user's unique session identifier.
 * @param {string} message - The message input from the user.
 * @returns {Promise<Object>} An object containing the AI response and updated progress state.
 */
export async function handleChat(sessionId, message) {
  const memory = getUserMemory(sessionId);
  const context = `You are a learning companion. Your goal is to adapt your teaching pace and style.
User's learning progress: ${JSON.stringify(memory.progress)}
The user is currently studying: ${memory.currentTopic || 'General topics'}.
If the user struggles, provide simpler explanations. If they understand, move to advanced topics or give a quiz.`;

  const cacheKey = `${sessionId}:${message}`;
  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse) {
    return { ...cachedResponse, cached: true };
  }

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
    
    const result = { response: responseText, progress: memory.progress };
    
    // [Efficiency] Store in cache
    responseCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Agent error:", error);
    return { 
      response: `[Fallback Response] I'm sorry, I couldn't process that right now. (Error: ${error.message})`,
      progress: memory.progress 
    };
  }
}
