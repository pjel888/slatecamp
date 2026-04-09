import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { getFeatureFlags, hasTierAccess } from "@/lib/admin/feature-flags";
import { ModuleViewer } from "@/features/3d-lab/components";
import { getModuleById } from "@/features/3d-lab/config/registry";

export const metadata = { title: "3D Lab Module" };

type PageParams = { moduleId: string };

export default async function LabModulePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { moduleId } = await params;
  
  // Verify module exists
  const module = getModuleById(moduleId);
  if (!module) {
    // Special case for legacy wall-configurator route
    if (moduleId === 'wall-configurator') {
      redirect(`${ROUTES.THREE_D_LAB}/unified-wall-configurator`);
    }
    notFound();
  }

  const [profile, flags] = await Promise.all([
    getAdminAwareProfile(),
    getFeatureFlags(),
  ]);
  
  if (!profile) redirect(ROUTES.LOGIN);
  
  const hasAccess =
    flags.bypass3dGate ||
    hasTierAccess("pro", profile.tier, profile.isAdmin, flags);

  if (!hasAccess) {
    redirect(ROUTES.THREE_D_LAB);
  }

  return (
    <div className="h-full w-full">
      <ModuleViewer modelId={moduleId} basePath={ROUTES.THREE_D_LAB} />
    </div>
  );
}
