
import React, { useState, useCallback } from 'react';
import { AppState, StudyLevel } from './types';
import SetupScreen from './components/SetupScreen';
import ChatScreen from './components/ChatScreen';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [chatConfig, setChatConfig] = useState<{ grade: string; level: StudyLevel; topic: string; } | null>(null);

  const handleSetupComplete = useCallback((grade: string, level: StudyLevel, topic: string) => {
    setChatConfig({ grade, level, topic });
    setAppState(AppState.CHAT);
  }, []);

  const handleReset = useCallback(() => {
    setChatConfig(null);
    setAppState(AppState.SETUP);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col font-sans text-gray-800 dark:text-gray-200">
      {appState === AppState.SETUP ? (
        <SetupScreen onSetupComplete={handleSetupComplete} />
      ) : chatConfig ? (
        <ChatScreen config={chatConfig} onReset={handleReset} />
      ) : null}
    </div>
  );
};

export default App;
