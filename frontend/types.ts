
export interface Recipient {
  [key: string]: string;
}

export type MessageSender = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  data?: any; 
}

export interface AuthState {
  isLoggedIn: boolean;
  userProfile: {
    name: string;
    email: string;
    picture: string;
  } | null;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}
