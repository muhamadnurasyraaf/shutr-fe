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
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
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
    async signIn({ user, account }) {
      // Send user data to your NestJS backend
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account?.providerAccountId,
            }),
          }
        );

        if (!response.ok) return false;

        const data = await response.json();
        // Store backend token in the user object
        const userData = user as typeof user & { backendToken?: string };
        userData.backendToken = data.accessToken;

        return true;
      } catch (error) {
        console.error("Backend auth error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // Persist backend token to JWT
      if (user) {
        const userData = user as typeof user & { backendToken?: string };
        if (userData.backendToken) {
          token.backendToken = userData.backendToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add backend token to session
      if (session.user) {
        session.backendToken = token.backendToken;
      }
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
