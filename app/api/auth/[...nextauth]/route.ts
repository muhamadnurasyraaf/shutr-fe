import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

declare module "next-auth" {
  interface Session extends DefaultSession {
    backendToken?: string;
    user?: {
      id?: string;
      email?: string;
      name?: string;
      image?: string;
      displayName?: string;
      phoneNumber?: string;
      type: "Creator" | "Customer";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    userId?: string;
    displayName?: string;
    phoneNumber?: string;
    type: "Creator" | "Customer";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Passwordless email login: the user has already received a one-time code
    // by email; here we exchange { email, code, type } with the backend for an
    // access token. No password is ever collected or stored.
    CredentialsProvider({
      id: "email-code",
      name: "Email Code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
        type: { label: "Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/email/verify-code`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              code: credentials.code,
              type: credentials.type,
            }),
          }
        );

        if (!response.ok) return null;

        const data = await response.json();
        // Shape must satisfy NextAuth's User; the extra fields are carried into
        // the JWT via the jwt() callback below.
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          image: data.user.image,
          backendToken: data.accessToken,
          displayName: data.user.displayName,
          phoneNumber: data.user.phoneNumber,
          type: data.user.type,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Passwordless email sign-in: authorize() already returned the backend
      // token and user fields, so copy them straight into the JWT.
      if (account?.provider === "email-code" && user) {
        const u = user as any;
        token.backendToken = u.backendToken;
        token.userId = u.id;
        token.displayName = u.displayName;
        token.phoneNumber = u.phoneNumber;
        token.type = u.type;
        return token;
      }

      // On initial Google sign in, fetch user data from backend
      if (account?.provider === "google" && user) {
        console.log("Fetching backend data for user:", user.email);

        const cookieStore = await cookies();
        const userType = cookieStore.get("pending_user_type")?.value;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: userType,
                idToken: account.id_token,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Backend response in JWT:", data);

            // Store all data in the token
            token.backendToken = data.accessToken;
            token.userId = data.user.id;
            token.displayName = data.user.displayName;
            token.phoneNumber = data.user.phoneNumber;
            token.type = data.user.type;

            console.log("Token after update:", token);
          }
        } catch (error) {
          console.error("Backend auth error:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token:", token);

      // Add all data from token to session
      if (session.user) {
        session.backendToken = token.backendToken;
        session.user.id = token.userId;
        session.user.displayName = token.displayName;
        session.user.phoneNumber = token.phoneNumber;
        session.user.type = token.type;
      }

      console.log("Session callback - final session:", session);
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
