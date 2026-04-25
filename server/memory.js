/**
 * In-memory storage for user sessions.
 * @type {Object.<string, Object>}
 */
const sessions = {};

/**
 * Retrieves the memory state for a given user session.
 * 
 * @param {string} sessionId - The unique identifier for the user's session.
 * @returns {Object} The user's memory state containing progress and topic information.
 */
export function getUserMemory(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      progress: {},
      currentTopic: null,
      history: []
    };
  }
  return sessions[sessionId];
}

/**
 * Updates the user's mastery level for a specific topic.
 * 
 * @param {string} sessionId - The user's session ID.
 * @param {string} topic - The topic to update.
 * @param {string} masteryLevel - The new mastery level.
 * @returns {Object} The updated progress object.
 */
export function updateProgress(sessionId, topic, masteryLevel) {
  const memory = getUserMemory(sessionId);
  memory.progress[topic] = masteryLevel;
  return memory.progress;
}

/**
 * Sets the current topic the user is studying.
 * 
 * @param {string} sessionId - The user's session ID.
 * @param {string} topic - The current topic.
 */
export function setCurrentTopic(sessionId, topic) {
  const memory = getUserMemory(sessionId);
  memory.currentTopic = topic;
}
