import { Suspense } from "react";
import { LabBrowser } from "@/app/dashboard/3d-lab/_components/Library/LabBrowser";
import { ModuleViewer } from "@/app/dashboard/3d-lab/_components/ModuleViewer";

type PageSearchParams = { model?: string };

export default async function Test3DPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const modelId = params.model;

  if (!modelId) {
    return (
      <div className="h-screen">
        <Suspense>
          <LabBrowser basePath="/test-3d" />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ModuleViewer modelId={modelId} basePath="/test-3d" />
    </div>
  );
}
