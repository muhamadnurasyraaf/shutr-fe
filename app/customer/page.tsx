import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CustomerDashboard from "./CustomerDashboard";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Creators belong on the creator dashboard — redirect server-side so the
  // customer view never flashes for them.
  if (session.user.type === "Creator") {
    redirect("/creator");
  }

  return <CustomerDashboard user={session.user} />;
}
