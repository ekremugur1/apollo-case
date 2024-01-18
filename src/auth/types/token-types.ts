export type AuthTokenContent = {
  user_id: number;
  email_address: string;
  company_id: number;
  createdAt: Date;
  updatedAt: Date;
};

export type RefreshTokenContent = {
  id: number;
  refresh: boolean;
};
