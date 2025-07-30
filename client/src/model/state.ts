import type { AuthState } from './auth';
import type { LangState } from './lang';

export interface AppState {
  auth: AuthState;
  lang: LangState;
}

