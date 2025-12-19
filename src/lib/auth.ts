import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Adapter } from "next-auth/adapters";
import { db } from "./db";
import { compare } from "bcrypt";

const DEMO_LOGIN = process.env.DEMO_LOGIN === "true";
const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@scheduler.local";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo123";
const DEMO_ROLE = (process.env.DEMO_ROLE as "ADMIN" | "TEACHER" | "STUDENT") || "ADMIN";
const HAS_DB = !!process.env.DATABASE_URL;

export const authOptions: NextAuthOptions = {
  adapter: HAS_DB ? (PrismaAdapter(db) as Adapter) : undefined,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (DEMO_LOGIN && credentials.email === DEMO_EMAIL && credentials.password === DEMO_PASSWORD) {
          return {
            id: "demo-user",
            email: DEMO_EMAIL,
            name: "Demo User",
            role: DEMO_ROLE,
          };
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (DEMO_LOGIN && token.email === DEMO_EMAIL) {
        token.id = "demo-user";
        token.name = "Demo User";
        token.email = DEMO_EMAIL;
        token.role = DEMO_ROLE;
        return token;
      }

      if (!HAS_DB) {
        if (user) {
          token.id = user.id as string;
          token.name = (user.name as string | null) ?? undefined;
          token.email = (user.email as string | null) ?? undefined;
          token.role = ((user as { role?: "ADMIN" | "TEACHER" | "STUDENT" }).role) ?? "STUDENT";
        }
        return token;
      }

      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      token.id = dbUser.id;
      token.name = dbUser.name ?? undefined;
      token.email = dbUser.email ?? undefined;
      token.role = dbUser.role;
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
