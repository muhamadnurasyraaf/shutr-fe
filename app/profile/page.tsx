
import ProfilePage from "@/app/pages/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Page(){
  const session = await getServerSession(authOptions);
  const user = session?.user;
  console.log("User in Profile Page:", user);

  return (<ProfilePage user={user!} />);
}