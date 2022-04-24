declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    SECRET_KEY: string;
    AUTH_HOST_URL: string;
  }
}
