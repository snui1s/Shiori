/// <reference types="astro/client" />

declare module "@auth/core/types" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      role?: string;
    } & import("@auth/core/types").DefaultSession["user"];
  }
}

declare module "auth-astro" {
  interface User {
    role?: string;
  }
}
