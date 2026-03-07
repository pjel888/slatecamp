import { DEMO_USER } from "./config";
import { getDemoDataForTable, DEMO_PROFILE } from "./data";

type Row = Record<string, unknown>;
type Filter = { col: string; op: string; val: unknown };

/* ------------------------------------------------------------------ */
/*  Persistent in-memory store (survives HMR via globalThis)          */
/* ------------------------------------------------------------------ */

const _g = globalThis as unknown as { __cerebro_demo_store?: Map<string, Row[]> };
const _store: Map<string, Row[]> = (_g.__cerebro_demo_store ??= new Map());

function getRows(table: string): Row[] {
  if (!_store.has(table)) {
    _store.set(table, [...(getDemoDataForTable(table) as Row[])]);
  }
  return _store.get(table)!;
}

function addRow(table: string, row: Row): Row {
  const rows = getRows(table);
  const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newRow: Row = { id, ...row, created_at: new Date().toISOString() };
  rows.push(newRow);
  return newRow;
}

function updateRows(table: string, filters: Filter[], patch: Row) {
  const rows = getRows(table);
  const cleaned: Row = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) cleaned[k] = v;
  }
  for (const row of rows) {
    if (matchesFilters(row, filters)) {
      Object.assign(row, cleaned);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Filtering                                                         */
/* ------------------------------------------------------------------ */

function matchesFilters(row: Row, filters: Filter[]): boolean {
  return filters.every(({ col, op, val }) => {
    const fieldVal = row[col];
    switch (op) {
      case "eq": return fieldVal === val;
      case "neq": return fieldVal !== val;
      case "lte": return typeof fieldVal === "string" && typeof val === "string" ? fieldVal <= val : Number(fieldVal) <= Number(val);
      case "gte": return typeof fieldVal === "string" && typeof val === "string" ? fieldVal >= val : Number(fieldVal) >= Number(val);
      case "is": return val === null ? fieldVal == null : fieldVal === val;
      case "not.is": return val === null ? fieldVal != null : fieldVal !== val;
      default: return true;
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Mock Query Builder                                                */
/* ------------------------------------------------------------------ */

class MockQueryBuilder {
  private table: string;
  private filters: Filter[] = [];
  private orFilter: string | null = null;
  private selectFields: string = "*";
  private isHead = false;
  private countMode: string | null = null;
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitCount: number | null = null;
  private isSingle = false;
  private mutationType: "insert" | "update" | "upsert" | "delete" | null = null;
  private mutationData: unknown = null;

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string = "*", options?: { count?: string; head?: boolean }) {
    this.selectFields = fields;
    if (options?.head) this.isHead = true;
    if (options?.count) this.countMode = options.count;
    return this;
  }

  eq(col: string, val: unknown) { this.filters.push({ col, op: "eq", val }); return this; }
  neq(col: string, val: unknown) { this.filters.push({ col, op: "neq", val }); return this; }
  lte(col: string, val: unknown) { this.filters.push({ col, op: "lte", val }); return this; }
  gte(col: string, val: unknown) { this.filters.push({ col, op: "gte", val }); return this; }
  not(col: string, op: string, val: unknown) { this.filters.push({ col, op: `not.${op}`, val }); return this; }
  or(filter: string) { this.orFilter = filter; return this; }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number) { this.limitCount = count; return this; }

  single() {
    this.isSingle = true;
    return this.resolve();
  }

  insert(data: unknown) {
    this.mutationType = "insert";
    this.mutationData = data;
    return this;
  }

  update(data: unknown) {
    this.mutationType = "update";
    this.mutationData = data;
    return this;
  }

  upsert(data: unknown) {
    this.mutationType = "upsert";
    this.mutationData = data;
    return this;
  }

  delete() {
    this.mutationType = "delete";
    return this;
  }

  private resolve(): { data: unknown; error: null; count?: number } {
    // --- Mutations ---
    if (this.mutationType === "insert") {
      const raw = this.mutationData as Row;
      const newRow = addRow(this.table, raw);
      if (this.isSingle) return { data: newRow, error: null };
      return { data: newRow, error: null };
    }

    if (this.mutationType === "update") {
      updateRows(this.table, this.filters, this.mutationData as Row);
      return { data: this.mutationData, error: null };
    }

    if (this.mutationType === "upsert") {
      const raw = this.mutationData as Row;
      const existing = getRows(this.table).find((r) => matchesFilters(r, this.filters));
      if (existing) {
        Object.assign(existing, raw);
        return { data: existing, error: null };
      }
      const newRow = addRow(this.table, raw);
      return { data: newRow, error: null };
    }

    if (this.mutationType === "delete") {
      const rows = getRows(this.table);
      const keep = rows.filter((r) => !matchesFilters(r, this.filters));
      _store.set(this.table, keep);
      return { data: null, error: null };
    }

    // --- Reads ---
    let rows = getRows(this.table).slice();

    if (this.orFilter) {
      const parts = this.orFilter.split(",");
      rows = rows.filter((row) =>
        parts.some((part) => {
          const match = part.trim().match(/^(\w+)\.eq\.(.+)$/);
          if (!match) return true;
          const [, col, val] = match;
          return String(row[col]) === val || row[col] === (val === "true" ? true : val === "false" ? false : val);
        })
      );
    }

    rows = rows.filter((row) => matchesFilters(row, this.filters));

    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.orderAsc;
      rows.sort((a, b) => {
        const av = a[col], bv = b[col];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = String(av) < String(bv) ? -1 : String(av) > String(bv) ? 1 : 0;
        return asc ? cmp : -cmp;
      });
    }

    if (this.isHead && this.countMode) {
      return { data: null, error: null, count: rows.length };
    }

    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);

    if (this.isSingle) {
      return { data: rows[0] ?? null, error: null };
    }

    return { data: rows, error: null, count: rows.length };
  }

  then(resolve: (val: { data: unknown; error: null; count?: number }) => void) {
    resolve(this.resolve());
  }
}

/* ------------------------------------------------------------------ */
/*  Mock Storage                                                      */
/* ------------------------------------------------------------------ */

class MockStorageBucket {
  upload(_path: string, _file: unknown) {
    return Promise.resolve({ data: { path: _path }, error: null });
  }
  download(_path: string) {
    return Promise.resolve({ data: null, error: { message: "Demo mode: no real files" } });
  }
  getPublicUrl(path: string) {
    return { data: { publicUrl: `/demo-storage/${path}` } };
  }
}

/* ------------------------------------------------------------------ */
/*  Public: createMockSupabaseClient                                  */
/* ------------------------------------------------------------------ */

export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({
        data: { user: { ...DEMO_USER } as unknown },
        error: null,
      }),
      getSession: () => Promise.resolve({
        data: { session: { user: { ...DEMO_USER } } as unknown },
        error: null,
      }),
      signInWithPassword: () => Promise.resolve({ data: { user: DEMO_USER, session: {} }, error: null }),
      signUp: () => Promise.resolve({ data: { user: DEMO_USER, session: {} }, error: null }),
      signInWithOAuth: () => Promise.resolve({ data: { url: "/dashboard" }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
      exchangeCodeForSession: () => Promise.resolve({ data: { session: {} }, error: null }),
      onAuthStateChange: (_cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table: string) => new MockQueryBuilder(table),
    rpc: (_fn: string, _params?: unknown) => Promise.resolve({ data: null, error: null }),
    storage: {
      from: (_bucket: string) => new MockStorageBucket(),
    },
  };
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
