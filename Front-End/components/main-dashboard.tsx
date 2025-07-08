import type { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar"; // Assuming you have this
import { Header } from "@/components/ui/header";   // Assuming you have this

// Define the type for the user object you expect from getUser()
// This should match the structure of the user object in your database
type User = {
  _id: string;
  name: string;
  email: string;
  streakCount?: number;
  points?: number;
  avatarUrl?: string;
  // Add other user properties as needed
} | null;

interface MainDashboardProps {
  children: ReactNode;
  user: User;
}

export function MainDashboard({ children, user }: MainDashboardProps) {
  // If the user is not logged in, and we are not on a public page,
  // you might want to render nothing or a redirect.
  // However, this logic is often best handled in middleware or the page itself.
  // For now, we'll assume the layout always renders the main structure.

  // The login/register pages might not need the full dashboard.
  // This can be handled by using different layouts for different routes.
  // For example, you could have an (auth) group with its own layout.
  // if (!user) {
  //   return <>{children}</>; // Or a specific layout for public pages
  // }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Pass the user prop down to the Header */}
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden">
        {/* Pass the user prop down to the Sidebar */}
        <Sidebar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
