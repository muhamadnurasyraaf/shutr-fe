import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // On initial sign in, fetch user data from backend
      if (account && user) {
        console.log("Fetching backend data for user:", user.email);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
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
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
