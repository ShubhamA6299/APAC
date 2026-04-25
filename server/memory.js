const sessions = {};

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

export function updateProgress(sessionId, topic, masteryLevel) {
  const memory = getUserMemory(sessionId);
  memory.progress[topic] = masteryLevel;
  return memory.progress;
}

export function setCurrentTopic(sessionId, topic) {
  const memory = getUserMemory(sessionId);
  memory.currentTopic = topic;
}
