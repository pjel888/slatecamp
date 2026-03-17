import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { getFeatureFlags, hasTierAccess } from "@/lib/admin/feature-flags";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import { SCIcon } from "@/components/graphics/icons/Icon";
import { ModuleGallery } from "./_components/ModuleGallery";
import { ModuleViewer } from "./_components/ModuleViewer";

export const metadata = { title: "3D Lab" };

type PageSearchParams = { model?: string };

export default async function ThreeDLabPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const profile = await getAdminAwareProfile();
  if (!profile) redirect(ROUTES.LOGIN);

  const flags = await getFeatureFlags();
  const hasAccess =
    flags.bypass3dGate ||
    hasTierAccess("camp", profile.tier, profile.isAdmin, flags);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <SCIcon icon={Lock} size="2xl" className="text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          3D Interactive Lab
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Explore building components, structural systems, and design concepts
          in three dimensions. Available for Camp, Insurance, and Institutional subscribers.
        </p>
        <Link href={ROUTES.SETTINGS_BILLING} className="mt-6">
          <Button>Upgrade to Camp</Button>
        </Link>
      </div>
    );
  }

  const params = await searchParams;
  const modelId = params.model;

  // No model param → show gallery
  if (!modelId) {
    return (
      <div className="h-full">
        <ModuleGallery basePath={ROUTES.THREE_D_LAB} />
      </div>
    );
  }

  // Model param present → full-screen viewer with back button (no sidebar)
  return (
    <div className="h-full">
      <ModuleViewer modelId={modelId} basePath={ROUTES.THREE_D_LAB} />
    </div>
  );
}
