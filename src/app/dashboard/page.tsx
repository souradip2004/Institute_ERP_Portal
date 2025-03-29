import { auth } from "@/auth"
import { LogoutButton } from "@/components/auth/logout-button";
import Image from "next/image";
export default async function DashboardPage() {
  const session = await auth();
  console.log(session);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Image src={session?.user?.image || "/placeholder.png"} alt={session?.user?.name || "Avatar"} className=" w-48 h-48" width={48} height={48} />
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-muted-foreground">You have successfully logged in to your account.</p>
        <LogoutButton />
      </div>
    </div>
  )
}

