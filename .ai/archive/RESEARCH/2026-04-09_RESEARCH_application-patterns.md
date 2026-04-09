# Application UI Patterns — Flowbite → SlateCamp Reference

**Created:** 2026-04-07
**Source:** `flowbite/flowbite-react-blocks-1.8.0-beta/app/application-ui/` + `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/application/`
**Figma:** Flowbite Design System Pro v3.1 (`Mg57xRjiaCCLm7P6JV1sJB`)
**Applies To:** All agents building admin, dashboard, or settings features

---

## 1. CRUD Layout Pattern

**Use for:** Admin question management, article management, 3D model management
**Ref:** `crud-layouts/` (6 variants) + `data/blocks/application/crud-layouts.md`
**Figma:** `node-id=1946-225388`

### Structure

```
┌─────────────────────────────────────────────────┐
│ Header: Search + [Add] + [Actions ▾] + [Filter ▾] │
├─────────────────────────────────────────────────┤
│ Table (ui/table.tsx)                            │
│   ├─ TableHeader (sortable columns)             │
│   ├─ TableBody (rows with actions)              │
│   └─ TableFooter (pagination + count)           │
├─────────────────────────────────────────────────┤
│ Footer: "Showing 1-10 of 100" + Pagination      │
└─────────────────────────────────────────────────┘
```

### SlateCamp Token Mapping

| Flowbite | SlateCamp |
|----------|-----------|
| `bg-gray-50 dark:bg-gray-900` (page bg) | `bg-canvas` |
| `bg-white dark:bg-gray-800` (card) | `bg-card` |
| `shadow-md sm:rounded-lg` | `shadow-card rounded-md` |
| `bg-primary-700 hover:bg-primary-800` (add button) | `bg-primary hover:bg-primary-700` via `<Button>` |
| `bg-white border border-gray-200` (secondary button) | `<Button variant="outline">` |
| `bg-gray-100 border-gray-300` (input) | `<Input>` / `<SearchInput>` |
| `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |
| `text-gray-900 dark:text-white` | `text-foreground` |

### Component Composition

```tsx
// Admin CRUD page pattern
<section className="bg-canvas p-4">
  <Card variant="elevated">
    {/* Header: search + actions */}
    <div className="flex items-center justify-between p-4">
      <SearchInput placeholder="Search..." className="max-w-sm" />
      <div className="flex items-center gap-2">
        <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1" /> Add</Button>
        <Button variant="outline" size="sm">Actions</Button>
        <Button variant="outline" size="sm">Filter</Button>
      </div>
    </div>

    {/* Table */}
    <Table>
      <TableHeader>...</TableHeader>
      <TableBody>...</TableBody>
    </Table>

    {/* Footer */}
    <div className="flex items-center justify-between p-4">
      <span className="text-sm text-muted-foreground">Showing 1-10 of 100</span>
      <Pagination>...</Pagination>
    </div>
  </Card>
</section>
```

### Variants Available

| Variant | File | Use Case |
|---------|------|----------|
| Default | `crud-layouts/default.tsx` | Standard table CRUD |
| Expandable rows | `crud-layouts/expandable-rows.tsx` | Question details inline |
| Horizontal cards | `crud-layouts/horizontal-cards.tsx` | Article card grid view |
| Product management | `crud-layouts/product-management.tsx` | Item management with images |
| User management | `crud-layouts/user-management.tsx` | Student/user admin |

### CRUD Modals/Drawers

| Action | Modal | Drawer |
|--------|-------|--------|
| Create | `create-modals/` → `<Dialog>` | `create-drawers/` → `<Sheet>` |
| Read | `read-modals/` → `<Dialog>` | `read-drawers/` → `<Sheet>` |
| Update | `update-modals/` → `<Dialog>` | `update-drawers/` → `<Sheet>` |
| Delete | `delete-confirm/` → `<AlertDialog>` | N/A |
| Success | `success-message/` → `<Alert variant="success">` | N/A |

---

## 2. Text Editor / Article Editor Pattern

**Use for:** Admin article editing, question editing, wiki content management
**Ref:** `publisher-ui/blog-templates/` + Figma `node-id=7714-5922`

### Structure

```
┌──────────────────────────────────────────┐
│ Editor Header                            │
│  Title input + Save/Publish buttons      │
├──────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Editor Panel    │ │ Preview/Meta    │ │
│ │                 │ │                 │ │
│ │ Rich text area  │ │ - Category      │ │
│ │ with toolbar    │ │ - Tags          │ │
│ │                 │ │ - SEO           │ │
│ │                 │ │ - Status        │ │
│ │                 │ │ - Publish date  │ │
│ └─────────────────┘ └─────────────────┘ │
└──────────────────────────────────────────┘
```

### SlateCamp Implementation Notes

- **Editor panel:** Use existing `<Textarea>` for simple content, or integrate a rich text editor for MDX
- **Meta sidebar:** Use `<Card>` with `<FormField>` for metadata inputs
- **Layout:** `grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4` on `bg-canvas`
- **Header:** Reuse `<DashboardHeader>` pattern with save/publish actions
- **Status:** Use `<Badge>` with `<StatusBadge>` for draft/published/archived states

---

## 3. Advanced Data Table Pattern

**Use for:** Quiz analytics, student progress, question banks, admin data views
**Ref:** `advanced-tables/` (8 variants) + `data/blocks/application/advanced-tables.md`
**Figma:** `node-id=1866-348090`

### Variants

| Variant | File | Use Case |
|---------|------|----------|
| Default | `advanced-tables/default.tsx` | Standard with search+filter |
| Comparison | `advanced-tables/comparison.tsx` | Side-by-side data comparison |
| Expandable | `advanced-tables/expandable-rows.tsx` | Row details inline |
| Sortable | `advanced-tables/sortable-rows.tsx` | Column sorting |
| Products | `advanced-tables/products.tsx` | Items with images |
| Project mgmt | `advanced-tables/project-management.tsx` | Task tracking |
| User mgmt | `advanced-tables/user-management.tsx` | Student/user lists |

### Table Header Pattern

From `data/blocks/application/table-headers.md`:

```tsx
<div className="flex items-center justify-between p-4 bg-card">
  <div className="flex items-center gap-2">
    <SearchInput size="sm" placeholder="Search..." />
    <Button variant="outline" size="sm">
      <Funnel className="w-3.5 h-3.5 mr-1" /> Filter
    </Button>
  </div>
  <div className="flex items-center gap-2">
    <span className="text-sm text-muted-foreground">1-10 of 100</span>
    <Pagination>...</Pagination>
  </div>
</div>
```

### Composing with ui/table.tsx (Phase 2)

The `ui/table.tsx` primitive from Phase 2 is the foundation. Advanced patterns layer on top:

- **Sortable:** Add `onClick` + sort icon to `<TableHead>`
- **Expandable:** Add collapsible `<TableRow>` below data rows
- **Filterable:** Add `<DropdownMenu>` with checkbox filters
- **Selectable:** Add `<Checkbox>` in first column

---

## 4. User Settings Pattern

**Use for:** `/dashboard/settings`, profile editing, notification preferences
**Ref:** `side-navigation/user-profile/` + Figma `node-id=2465-181398`

### Structure

```
┌──────────────┬──────────────────────────┐
│ Settings Nav │ Settings Content         │
│              │                          │
│ • Profile    │ ┌──────────────────────┐ │
│ • Account    │ │ Section Title        │ │
│ • Security   │ │ Description          │ │
│ • Notifs     │ │                      │ │
│ • Billing    │ │ FormField            │ │
│              │ │ FormField            │ │
│              │ │ FormField            │ │
│              │ │                      │ │
│              │ │ [Save] [Cancel]      │ │
│              │ └──────────────────────┘ │
└──────────────┴──────────────────────────┘
```

### SlateCamp Implementation

```tsx
// Settings page layout
<div className="flex gap-6">
  {/* Settings nav - reuse SidebarNavGroup */}
  <aside className="w-[200px] shrink-0">
    <SidebarNavGroup>
      <SidebarNavItem href="/settings/profile" label="Profile" icon={<User />} active />
      <SidebarNavItem href="/settings/account" label="Account" icon={<Gear />} />
      <SidebarNavItem href="/settings/security" label="Security" icon={<Lock />} />
      <SidebarNavItem href="/settings/notifications" label="Notifications" icon={<Bell />} />
    </SidebarNavGroup>
  </aside>

  {/* Settings content */}
  <Card className="flex-1">
    <CardHeader>
      <CardTitle>Profile Settings</CardTitle>
      <CardDescription>Update your personal information.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <FormField label="Full name" htmlFor="name" required>
        <Input id="name" />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input id="email" type="email" />
      </FormField>
    </CardContent>
    <CardFooter className="justify-end gap-2">
      <Button variant="outline">Cancel</Button>
      <Button>Save changes</Button>
    </CardFooter>
  </Card>
</div>
```

### Key Components Used

- `SidebarNavGroup` + `SidebarNavItem` (from `shared/sidebar-nav.tsx`)
- `Card` + `CardHeader` + `CardContent` + `CardFooter`
- `FormField` + `Input` / `Select` / `Switch` / `Textarea`
- `Button` (primary save, outline cancel)
- `Avatar` (profile image)

---

## 5. Notification Pattern

**Use for:** Dashboard notification panel, notification dropdown, notification center
**Ref:** `side-navigation/notifications/` + Figma `node-id=3429-64824`

### Dropdown Pattern (Navbar integration)

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon-sm" className="relative">
      <Bell className="w-5 h-5" />
      {/* Unread indicator */}
      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-80">
    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
      <span className="text-sm font-medium">Notifications</span>
      <Button variant="link" size="sm">Mark all read</Button>
    </div>
    <ListGroup variant="flush">
      <ListGroupItem icon={<CheckCircle className="text-success" />}>
        <div>
          <p className="text-sm font-medium">Quiz completed</p>
          <p className="text-xs text-muted-foreground">PD 1096 — 85% score</p>
        </div>
      </ListGroupItem>
      {/* ... more items */}
    </ListGroup>
    <div className="px-3 py-2 border-t border-border text-center">
      <Button variant="link" size="sm">View all notifications</Button>
    </div>
  </DropdownMenuContent>
</DropdownMenu>
```

### Full Page Pattern

For `/dashboard/notifications`:

```tsx
<div className="max-w-2xl mx-auto">
  <SectionHeader level="page" title="Notifications" />
  <Tabs defaultValue="all">
    <TabsList>
      <TabsTrigger value="all">All</TabsTrigger>
      <TabsTrigger value="unread">Unread (3)</TabsTrigger>
    </TabsList>
    <TabsContent value="all">
      <Card>
        <ListGroup>
          {notifications.map(n => (
            <ListGroupItem key={n.id} icon={...} trailing={<time>...</time>}>
              ...
            </ListGroupItem>
          ))}
        </ListGroup>
      </Card>
    </TabsContent>
  </Tabs>
</div>
```

---

## 6. Sidebar Layout Variants

**Use for:** Dashboard sidebar, admin sidebar, developer portal sidebar
**Ref:** `side-navigation/` (13 variants) + Figma `node-id=13778-78120`

### Available Variants

| Variant | Directory | Use Case |
|---------|-----------|----------|
| Default | `side-navigation/default/` | Standard sidebar |
| Double | `side-navigation/double/` | Rail + expanded panel |
| Notifications | `side-navigation/notifications/` | Sidebar with notification panel |
| User Profile | `side-navigation/user-profile/` | Profile section in sidebar |
| User Switch | `side-navigation/user-switch/` | Multi-account sidebar |
| Search | `side-navigation/search/` | Sidebar with search |
| Projects/Team | `side-navigation/projects-team-switch/` | Project selector |
| Alert Info | `side-navigation/alert-info/` | Sidebar with alert banner |
| User Contacts | `side-navigation/user-contacts/` | Contact list sidebar |
| Secondary User | `side-navigation/secondary-user-contacts/` | Secondary contact panel |
| Crypto | `side-navigation/crypto/` | Dashboard with data panels |
| Double Tasks | `side-navigation/double-tasks/` | Task management sidebar |

### SlateCamp Sidebar Architecture

Current: `SidebarNavGroup` + `SidebarNavItem` in `shared/sidebar-nav.tsx`

For richer layouts, compose:

```tsx
<aside className="w-[260px] shrink-0 bg-muted/40 flex flex-col h-full">
  {/* User section (optional) */}
  <div className="p-3 border-b border-border">
    <div className="flex items-center gap-2">
      <Avatar size="sm" />
      <div>
        <p className="text-sm font-medium">Student Name</p>
        <p className="text-xs text-muted-foreground">Free Plan</p>
      </div>
    </div>
  </div>

  {/* Search (optional) */}
  <div className="p-2">
    <SearchInput size="sm" placeholder="Search..." />
  </div>

  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto p-2">
    <SidebarNavGroup label="Dashboard">
      <SidebarNavItem href="/dashboard" label="Home" icon={<House />} />
      <SidebarNavItem href="/dashboard/drills" label="Drills" icon={<Exam />} />
    </SidebarNavGroup>
  </nav>

  {/* Footer (optional) */}
  <div className="p-3 border-t border-border">
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <Gear className="w-4 h-4 mr-2" /> Settings
    </Button>
  </div>
</aside>
```

---

## 7. Application Shell Pattern

**Use for:** Dashboard layout wrapper, admin layout wrapper
**Ref:** `application-shells/` + `dashboard-navbars/` + `dashboard-footers/`

### Standard Shell

```
┌─────────────────────────────────────────────┐
│ Navbar (h-12, border-b, bg-card)            │
├──────────┬──────────────────────────────────┤
│ Sidebar  │ Main Content                     │
│ (w-260)  │                                  │
│ bg-muted │ bg-canvas                        │
│          │                                  │
│          │ ┌─ DashboardHeader ────────────┐ │
│          │ │ Page Title + Actions         │ │
│          │ └─────────────────────────────┘ │
│          │                                  │
│          │ ┌─ Content ───────────────────┐ │
│          │ │ Cards on bg-canvas          │ │
│          │ │ (use shadow-card)           │ │
│          │ └─────────────────────────────┘ │
├──────────┴──────────────────────────────────┤
│ BottomNavigation (mobile only, lg:hidden)    │
└─────────────────────────────────────────────┘
```

---

## Component Cross-Reference

All patterns above use components from the SlateCamp design system:

| Pattern Need | SlateCamp Component | Phase Built |
|-------------|-------------------|-------------|
| Data tables | `ui/table.tsx` | Phase 2 |
| Pagination | `ui/pagination.tsx` | Phase 2 |
| Alerts/Feedback | `ui/alert.tsx` | Phase 2 |
| Step indicators | `ui/stepper.tsx` | Phase 2 |
| List items | `ui/list-group.tsx` | Phase 2 |
| Breadcrumbs | `ui/breadcrumb.tsx` | Phase 2 |
| Cards | `ui/card.tsx` (elevated variant) | Phase 3 |
| Bottom nav | `ui/bottom-navigation.tsx` | Phase 3 |
| Sidebar nav | `shared/sidebar-nav.tsx` | Phase 3 (audited) |
| Dashboard header | `shared/DashboardHeader.tsx` | Phase 3 (fixed) |
| Form fields | `ui/form-field.tsx` | Phase 4 (stories) |
| Toasts | `ui/toast.tsx` | Phase 5 (fixed) |
| Progress | `ui/progress.tsx` | Phase 5 (fixed) |
| Badges | `ui/badge.tsx` | Phase 5 (audited) |
| Empty states | `shared/empty-state.tsx` | Phase 5 (audited) |

---

*This document is a pattern reference, not a code generator. When implementing any pattern, adapt the structure to SlateCamp's existing components and design tokens per `.ai/rules/flowbite-alignment.md`.*
