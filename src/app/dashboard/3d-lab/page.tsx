import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { getFeatureFlags, hasTierAccess } from "@/lib/admin/feature-flags";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";
import {
  ThreeDLabClient,
  type TreeNode,
  type ModelId,
} from "@/components/3d/Workspace";

export const metadata = { title: "3D Lab" };

const MOCK_TREE: TreeNode[] = [
  {
    id: "history",
    label: "History of Architecture",
    children: [
      {
        id: "greek",
        label: "Greek",
        children: [
          {
            id: "parthenon",
            label: "Parthenon",
            modelId: "greek-parthenon",
          },
        ],
      },
      {
        id: "roman",
        label: "Roman",
        children: [
          {
            id: "pantheon",
            label: "Pantheon",
            modelId: "roman-pantheon",
          },
        ],
      },
    ],
  },
  {
    id: "elements",
    label: "Building Elements",
    children: [
      {
        id: "columns",
        label: "Columns",
        children: [
          {
            id: "corinthian-capital",
            label: "Corinthian Capital",
            modelId: "corinthian-capital",
          },
        ],
      },
    ],
  },
  {
    id: "zoning",
    label: "Zoning & Regulations",
    children: [
      {
        id: "nbcp-envelope",
        label: "NBCP Envelope Generator \u2746",
        modelId: "nbcp-envelope",
      },
    ],
  },
];

function getDefaultModelId(tree: TreeNode[]): ModelId {
  for (const node of tree) {
    if (node.modelId) return node.modelId;
    if (node.children) {
      const child = getDefaultModelId(node.children);
      if (child) return child;
    }
  }
  return "greek-parthenon";
}

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
        <Lock className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
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
  const modelFromUrl = params.model as ModelId | undefined;
  const initialModelId = modelFromUrl ?? getDefaultModelId(MOCK_TREE);

  return (
    <div className="h-full">
      <ThreeDLabClient
        tree={MOCK_TREE}
        initialModelId={initialModelId}
        basePath={ROUTES.THREE_D_LAB}
      />
    </div>
  );
}
