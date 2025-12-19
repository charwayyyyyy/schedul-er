import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { compare } from "bcrypt";

const DEMO_LOGIN = process.env.DEMO_LOGIN === "true";
const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@scheduler.local";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo123";
const DEMO_ROLE = (process.env.DEMO_ROLE as "ADMIN" | "TEACHER" | "STUDENT") || "ADMIN";
const HAS_DB = !!process.env.DATABASE_URL;

export const authOptions: NextAuthOptions = {
  adapter: HAS_DB ? PrismaAdapter(db) : (undefined as unknown as any),
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
        return {
          id: "demo-user",
          name: "Demo User",
          email: DEMO_EMAIL,
          role: DEMO_ROLE,
        };
      }

      if (!HAS_DB) {
        if (user) {
          token.id = user.id as string;
          token.name = user.name;
          token.email = user.email;
          token.role = (user as any).role;
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

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
