
import NextAuth, { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from '@/db/mongo';
import bcrypt from "bcryptjs";


import type { AuthOptions, SessionStrategy } from "next-auth";
import { UserRepository } from "@/db/user.repository";
import { PasswordUtils } from "@/lib/passwords/password";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined): Promise<NextAuthUser | null> {
        if (!credentials) return null;
        const userRepo = new UserRepository();
        const result = await userRepo.findUserLocalLogin(credentials.email);

       
        var valid = await PasswordUtils.validate(credentials.password, result?.currentPassword);

        if (valid && valid.valid && result){
          try{if (valid.newProtectedPassword) { userRepo.setPassword(result.user.email, valid.newProtectedPassword)}} catch (error) {
            console.error("Error setting new password, ignorning", error);
          }
          return { id: result.user._id, name: result.user.displayName, email: result.user.email } as NextAuthUser;
        }

        return null;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : (() => {
          console.warn("[next-auth] Google provider not configured: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
          return [];
        })()
    ),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: any }) {
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
