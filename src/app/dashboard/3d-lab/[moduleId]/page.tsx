import { redirect, notFound } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { ModuleViewer } from "@/features/3d-lab/components";
import { getModuleById } from "@/features/3d-lab/config/registry";
import { getViewerEntitlements } from "@/lib/entitlements/get-viewer-entitlements";
import { ENTITLEMENT_FEATURE_KEYS } from "@/lib/entitlements/feature-keys";

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

  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.threeDLabFull,
  ]);

  if (!entitlements.userId) redirect(ROUTES.LOGIN);

  const hasAccess =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.threeDLabFull]?.allowed ?? false;

  if (!hasAccess) {
    redirect(ROUTES.THREE_D_LAB);
  }

  return (
    <div className="h-full w-full">
      <ModuleViewer modelId={moduleId} basePath={ROUTES.THREE_D_LAB} />
    </div>
  );
}
