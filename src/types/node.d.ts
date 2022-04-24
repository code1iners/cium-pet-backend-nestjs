declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    NODE_ENV: 'local' | 'development' | 'production';
    SECRET_KEY: string;
    AUTH_HOST_URL: string;
  }
}
