import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import { LabBrowser, LabBrowserShell } from "@/features/3d-lab/components";
import { THREE_D_LAB_GATE_COPY } from "@/features/3d-lab/gate-copy";
import { getViewerEntitlements } from "@/lib/entitlements/get-viewer-entitlements";
import { ENTITLEMENT_FEATURE_KEYS } from "@/lib/entitlements/feature-keys";

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
    redirect(`${ROUTES.lab.root}/${modelId}`);
  }

  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.threeDLabFull,
  ]);

  if (!entitlements.userId) redirect(ROUTES.auth.login);

  const hasAccess =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.threeDLabFull]?.allowed ?? false;

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
          <Link href={ROUTES.dashboard.settingsBilling} className="mt-6">
            <Button>{THREE_D_LAB_GATE_COPY.ctaLabel}</Button>
          </Link>
        </div>
      </LabBrowserShell>
    );
  }

  return (
    <LabBrowserShell>
      <Suspense key="lab-browser-suspense" fallback={null}>
        <LabBrowser basePath={ROUTES.lab.root} />
      </Suspense>
    </LabBrowserShell>
  );
}
