import { getServerSession } from "next-auth";
import { db } from "./db";
import { Profile } from "@prisma/client";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const initProfile: () => Promise<Profile | null> = async () => {
    const session = await getServerSession(authOptions);

    console.log("session: " + session?.user.id);

    const user = session?.user;

    if (!user) return redirect("/sign-in");

    const profile = await db.profile.findFirst({ where: { userId: user.id } });

    if (profile) return profile;

    const newProfile = await db.profile.create({
        data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            imageUrl: user.image,
        },
    });

    return newProfile;
};

export default initProfile;
