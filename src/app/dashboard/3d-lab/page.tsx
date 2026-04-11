import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { getFeatureFlags, hasTierAccess } from "@/lib/admin/feature-flags";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import { LabBrowser, LabBrowserShell } from "@/features/3d-lab/components";
import { THREE_D_LAB_GATE_COPY } from "@/features/3d-lab/gate-copy";

export const metadata = { title: "3D Lab" };

type PageSearchParams = { model?: string };

export default async function ThreeDLabPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const modelId = params.model;

  // Legacy Redirect: ?model= → /[moduleId]
  if (modelId) {
    redirect(`${ROUTES.THREE_D_LAB}/${modelId}`);
  }

  const [profile, flags] = await Promise.all([
    getAdminAwareProfile(),
    getFeatureFlags(),
  ]);
  
  if (!profile) redirect(ROUTES.LOGIN);
  
  const hasAccess =
    flags.bypass3dGate ||
    hasTierAccess("pro", profile.tier, profile.hasInternalTierBypass, flags);

  if (!hasAccess) {
    return (
      <LabBrowserShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Lock size={48} className="text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            {THREE_D_LAB_GATE_COPY.title}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {THREE_D_LAB_GATE_COPY.description}
          </p>
          <Link href={ROUTES.SETTINGS_BILLING} className="mt-6">
            <Button>{THREE_D_LAB_GATE_COPY.ctaLabel}</Button>
          </Link>
        </div>
      </LabBrowserShell>
    );
  }

  return (
    <LabBrowserShell>
      <Suspense key="lab-browser-suspense" fallback={null}>
        <LabBrowser basePath={ROUTES.THREE_D_LAB} />
      </Suspense>
    </LabBrowserShell>
  );
}
