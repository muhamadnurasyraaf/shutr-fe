import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { fetchCreatorProfile } from "../api/actions/creator";
import PhotographerProfile from "../pages/creator/Profile";
import { redirect } from "next/navigation";

export default async function Page(){

    const session = await getServerSession(authOptions);

    if(!session?.user?.id){
       redirect("/auth/signin");
    }

    // Customers belong on the customer dashboard — redirect server-side so the
    // creator view never flashes for them.
    if (session.user.type === "Customer") {
       redirect("/customer");
    }

    const user = await fetchCreatorProfile(session?.user?.id)

    return <PhotographerProfile user={user} />
}