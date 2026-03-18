// MOCK MODE — swap this import to real API client later
import * as mock from '@/mock/agent.mock';

export const chatRegistration = mock.chatRegistration;
export const chatHealth = mock.chatHealth;
export const getHealthWelcome = mock.getHealthWelcome;
export const getRegistrationWelcome = mock.getRegistrationWelcome;
export const getInitialRegistrationState = mock.getInitialRegistrationState;
export type { RegistrationState, RegistrationStep } from '@/mock/agent.mock';
