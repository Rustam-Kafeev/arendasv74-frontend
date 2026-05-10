// chatReducer.ts
export interface ChatState {
  messages: any[];
  newMsg: string;
  convId: number | null;
  loading: boolean;
  error: string | null;
  conversations: any[];
  showChatList: boolean;
  showTemplates: boolean;
  customTemplates: string[];
  newTemplate: string;
  showAddTemplate: boolean;
  phoneNumber: string | null;
  lightboxImage: string | null;
}

export type ChatAction =
  | { type: 'SET_CONV_ID'; payload: number | null }
  | { type: 'SET_MESSAGES'; payload: any[] }
  | { type: 'ADD_OPTIMISTIC_MESSAGE'; payload: any }
  | { type: 'REMOVE_OPTIMISTIC_MESSAGE'; payload: number }
  | { type: 'SET_NEW_MSG'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: any[] }
  | { type: 'SET_SHOW_CHAT_LIST'; payload: boolean }
  | { type: 'SET_SHOW_TEMPLATES'; payload: boolean }
  | { type: 'SET_CUSTOM_TEMPLATES'; payload: string[] }
  | { type: 'SET_NEW_TEMPLATE'; payload: string }
  | { type: 'SET_SHOW_ADD_TEMPLATE'; payload: boolean }
  | { type: 'SET_PHONE_NUMBER'; payload: string | null }
  | { type: 'SET_LIGHTBOX_IMAGE'; payload: string | null }
  | { type: 'RESET_CHAT' };

export const initialChatState: ChatState = {
  messages: [],
  newMsg: '',
  convId: null,
  loading: false,
  error: null,
  conversations: [],
  showChatList: false,
  showTemplates: false,
  customTemplates: [],
  newTemplate: '',
  showAddTemplate: false,
  phoneNumber: null,
  lightboxImage: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONV_ID':
      return { ...state, convId: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_OPTIMISTIC_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'REMOVE_OPTIMISTIC_MESSAGE':
      return { ...state, messages: state.messages.filter(m => m.id !== action.payload) };
    case 'SET_NEW_MSG':
      return { ...state, newMsg: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_SHOW_CHAT_LIST':
      return { ...state, showChatList: action.payload };
    case 'SET_SHOW_TEMPLATES':
      return { ...state, showTemplates: action.payload };
    case 'SET_CUSTOM_TEMPLATES':
      return { ...state, customTemplates: action.payload };
    case 'SET_NEW_TEMPLATE':
      return { ...state, newTemplate: action.payload };
    case 'SET_SHOW_ADD_TEMPLATE':
      return { ...state, showAddTemplate: action.payload };
    case 'SET_PHONE_NUMBER':
      return { ...state, phoneNumber: action.payload };
    case 'SET_LIGHTBOX_IMAGE':
      return { ...state, lightboxImage: action.payload };
    case 'RESET_CHAT':
      return { ...initialChatState, customTemplates: state.customTemplates };
    default:
      return state;
  }
}