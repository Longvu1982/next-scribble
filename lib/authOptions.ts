import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  // adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOGGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOGGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      return { ...session, user: { ...session.user, id: token.sub } };
    },
    // jwt: async ({ profile, token, user, session }) => ({
    //     profile,
    //     token,
    //     user,
    //     session,
    // }),
  },
};
