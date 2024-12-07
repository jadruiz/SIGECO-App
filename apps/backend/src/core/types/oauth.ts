// src/types/oauth.ts

export interface OAuthUserProfile {
  access_token: string;
  refresh_token?: string;
  user: {
    username: string;
    email: string;
    photo?: string;
    firstname?: string;
    lastname?: string;
    googleAccessToken?: string;
    googleRefreshToken?: string;
  };
}
