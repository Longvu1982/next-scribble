import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongoClient";

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

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
