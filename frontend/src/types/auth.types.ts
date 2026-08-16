export interface IUser {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

export interface SignupInput {
  username: string;
  email: string;
  password: string;
}

export interface SigninInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: IUser;
}
