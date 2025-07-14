export interface NewUserBody {
  username: string;
  password: string;
  email?: string;
  isAdmin?: boolean;
}
