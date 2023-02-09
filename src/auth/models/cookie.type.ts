import { CookieOptions } from 'express';

export type CookieType = {
  name: string;
  value: string;
  options: CookieOptions;
};

export type Cookies = {
  accessToken: CookieType;
  refreshToken: CookieType;
};
