import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { getCurrentUser, createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Run&Roast - Défis sportifs entre amis",
  description: "Créez des défis sportifs privés connectés à Strava et défiez vos amis",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  // Get Strava connection if user is logged in
  let stravaConnection = null;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('strava_connections')
      .select('athlete_profile_image')
      .eq('user_id', user.id)
      .single();
    stravaConnection = data;
  }

  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <Header user={user} stravaConnection={stravaConnection} />
        <main>{children}</main>
      </body>
    </html>
  );
}
