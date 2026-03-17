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
import { MODULE_REGISTRY, SUBJECT_AREAS } from "./_config/moduleRegistry";
import { ModuleGallery } from "./_components/ModuleGallery";

export const metadata = { title: "3D Lab" };

// ─── Legacy Tree (backwards compat for tree sidebar) ───────────────────────

const LEGACY_TREE: TreeNode[] = [
  {
    id: "practice",
    label: "Architectural Practice",
    children: [
      {
        id: "zoning",
        label: "Zoning & Building Codes",
        children: [
          {
            id: "far-calculator",
            label: "FAR & BHL Calculator ✦",
            modelId: "far-calculator",
          },
        ],
      },
    ],
  },
  {
    id: "history",
    label: "History of Architecture",
    children: [
      {
        id: "classical-orders",
        label: "Classical Orders",
        children: [
          {
            id: "classical-orders-scene",
            label: "Column Anatomy Inspector ✦",
            modelId: "classical-orders",
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
        label: "NBCP Envelope Generator ✦",
        modelId: "nbcp-envelope",
      },
    ],
  },
];

/** Build tree nodes from the module registry, merging with legacy entries */
function buildFullTree(): TreeNode[] {
  const tree: TreeNode[] = [...LEGACY_TREE];

  // Group new template modules by subject
  const builtOrReadyModules = MODULE_REGISTRY.filter(
    (m) =>
      (m.status === "built" || m.status === "ready") &&
      // Exclude modules already in legacy tree
      !["far-calculator", "nbcp-envelope"].includes(m.id) &&
      m.id !== "classical-orders"
  );

  const bySubject = new Map<string, TreeNode[]>();
  for (const m of builtOrReadyModules) {
    const subjectLabel =
      SUBJECT_AREAS.find((s) => s.id === m.subject)?.label ?? m.subject;
    if (!bySubject.has(subjectLabel)) bySubject.set(subjectLabel, []);
    bySubject.get(subjectLabel)!.push({
      id: m.id,
      label: m.title,
      modelId: m.id,
    });
  }

  for (const [subject, children] of bySubject) {
    tree.push({
      id: `subject-${subject}`,
      label: subject,
      children,
    });
  }

  return tree;
}

function getDefaultModelId(tree: TreeNode[]): ModelId {
  for (const node of tree) {
    if (node.modelId) return node.modelId;
    if (node.children) {
      const child = getDefaultModelId(node.children);
      if (child) return child;
    }
  }
  return "far-calculator";
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

  // No model param → show gallery
  if (!modelFromUrl) {
    return (
      <div className="h-full">
        <ModuleGallery basePath={ROUTES.THREE_D_LAB} />
      </div>
    );
  }

  // Model param present → render 3D viewport with tree nav
  const fullTree = buildFullTree();
  const initialModelId = modelFromUrl ?? getDefaultModelId(fullTree);

  return (
    <div className="h-full">
      <ThreeDLabClient
        tree={fullTree}
        initialModelId={initialModelId}
        basePath={ROUTES.THREE_D_LAB}
      />
    </div>
  );
}
