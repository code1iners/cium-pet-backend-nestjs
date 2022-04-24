import { IncomingHttpHeaders } from 'http';

declare module 'http' {
  interface IncomingHttpHeaders {
    refreshToken: string;
  }
}
