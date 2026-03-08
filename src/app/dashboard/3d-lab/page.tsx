import { redirect } from "next/navigation";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { getFeatureFlags, hasTierAccess } from "@/lib/admin/feature-flags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata = { title: "3D Lab" };

const CATEGORIES = [
  {
    name: "Structural Systems",
    desc: "Truss types, beam connections, foundation types",
    icon: "🏗️",
  },
  {
    name: "Building Envelope",
    desc: "Wall sections, curtain walls, waterproofing",
    icon: "🧱",
  },
  {
    name: "MEP Systems",
    desc: "Plumbing, HVAC, electrical distribution",
    icon: "⚡",
  },
  {
    name: "Architectural Details",
    desc: "Doors, windows, stairs, railings",
    icon: "🚪",
  },
  {
    name: "Site Planning",
    desc: "Contour grading, setbacks, solar analysis",
    icon: "🗺️",
  },
  {
    name: "Design History",
    desc: "Parthenon orders, Gothic vaults, Bauhaus",
    icon: "🏛️",
  },
];

export default async function ThreeDLabPage() {
  const profile = await getAdminAwareProfile();
  if (!profile) redirect("/login");

  const flags = await getFeatureFlags();
  const hasAccess =
    flags.bypass3dGate ||
    hasTierAccess("pro", profile.tier, profile.isAdmin, flags);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Lock className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          3D Interactive Lab
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Explore building components, structural systems, and design concepts
          in three dimensions. Available for Pro and Max subscribers.
        </p>
        <Link href="/dashboard/settings/billing" className="mt-6">
          <Button>Upgrade to Pro</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">3D Lab</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interact with 3D building components and architectural models.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Card
            key={cat.name}
            className="cursor-pointer transition-all hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <CardTitle className="text-sm">{cat.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{cat.desc}</p>
              <Badge variant="secondary" className="mt-3 text-[10px]">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
