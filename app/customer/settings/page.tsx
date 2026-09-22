import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { fetchCustomerProfile } from "../../api/actions/customer";
import CustomerSettings from "./CustomerSettings";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Creators have their own settings within the creator area.
  if (session.user.type === "Creator") {
    redirect("/creator");
  }

  const profile = await fetchCustomerProfile(session.user.id);

  return <CustomerSettings profile={profile} />;
}
