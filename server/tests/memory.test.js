import { jest } from '@jest/globals';
import { getUserMemory, updateProgress, setCurrentTopic } from '../memory.js';

describe('Memory Management', () => {
  it('should initialize a new user session correctly', () => {
    const sessionId = 'test-session-1';
    const memory = getUserMemory(sessionId);
    
    expect(memory).toBeDefined();
    expect(memory.progress).toBeDefined();
    expect(memory.currentTopic).toBeNull();
    expect(Array.isArray(memory.history)).toBe(true);
  });

  it('should update user mastery level for a specific topic', () => {
    const sessionId = 'test-session-2';
    const progress = updateProgress(sessionId, 'React', 'intermediate');
    
    expect(progress['React']).toBe('intermediate');
    
    const memory = getUserMemory(sessionId);
    expect(memory.progress['React']).toBe('intermediate');
  });

  it('should set the current topic correctly', () => {
    const sessionId = 'test-session-3';
    setCurrentTopic(sessionId, 'Machine Learning');
    
    const memory = getUserMemory(sessionId);
    expect(memory.currentTopic).toBe('Machine Learning');
  });
});
