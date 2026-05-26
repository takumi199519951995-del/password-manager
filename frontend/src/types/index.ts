export type User = {
  id: string;
  email: string;
};

export type Password = {
  id: string;
  serviceName: string;
  username: string;
  password: string;
  url?: string;
  category?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginForm = {
  email: string;
  password: string;
};

export type RegisterForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type PasswordForm = {
  serviceName: string;
  username: string;
  password: string;
  url?: string;
  category?: string;
  memo?: string;
};
