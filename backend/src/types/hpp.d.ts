declare module 'hpp' {
  import { RequestHandler } from 'express';

  interface HppOptions {
    whitelist?: string[] | { [key: string]: boolean };
  }

  const hpp: (options?: HppOptions) => RequestHandler;

  export = hpp;
}