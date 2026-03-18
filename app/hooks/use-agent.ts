import { useState, useCallback } from 'react';
import { Message, Cattle } from '@/types';
import * as agentService from '@/services/agent';
import { RegistrationState } from '@/services/agent';

type AgentMode = 'registration' | 'health';

export function useAgent(mode: AgentMode, cattle?: Cattle) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const welcomeContent =
      mode === 'registration'
        ? agentService.getRegistrationWelcome()
        : agentService.getHealthWelcome(cattle);

    return [
      {
        id: 'welcome',
        role: 'assistant' as const,
        content: welcomeContent,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [isTyping, setIsTyping] = useState(false);
  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    agentService.getInitialRegistrationState()
  );
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        let responseContent: string;

        if (mode === 'registration') {
          const result = await agentService.chatRegistration(registrationState, content);
          responseContent = result.response;
          setRegistrationState(result.nextState);
          if (result.isComplete) {
            setIsRegistrationComplete(true);
          }
        } else {
          responseContent = await agentService.chatHealth(content, cattle);
        }

        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [mode, cattle, registrationState]
  );

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          mode === 'registration'
            ? agentService.getRegistrationWelcome()
            : agentService.getHealthWelcome(cattle),
        timestamp: new Date().toISOString(),
      },
    ]);
    setRegistrationState(agentService.getInitialRegistrationState());
    setIsRegistrationComplete(false);
  }, [mode, cattle]);

  return {
    messages,
    isTyping,
    sendMessage,
    resetChat,
    registrationState,
    isRegistrationComplete,
  };
}
