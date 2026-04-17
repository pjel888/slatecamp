# SlateCamp Architecture Overview

This document contains a comprehensive Mermaid diagram outlining the high-level architecture, portals, major components, state management, and pedagogical engine of the SlateCamp platform.

## High-Level Architecture Diagram

```mermaid
flowchart TD
    %% Styling Classes
    classDef portal fill:#1B3FC4,stroke:#0B2375,stroke-width:2px,color:#fff,font-weight:bold;
    classDef engine fill:#E8853A,stroke:#A1541A,stroke-width:2px,color:#fff,font-weight:bold;
    classDef data fill:#1A2332,stroke:#090C12,stroke-width:2px,color:#fff,font-weight:bold;
    classDef ui fill:#F8F7F5,stroke:#D4DAE3,stroke-width:1px,color:#1A2332;
    classDef client fill:#2D9F6F,stroke:#1A6A48,stroke-width:2px,color:#fff,font-weight:bold;

    %% Client Layer
    subgraph ClientLayer ["Client / Browser (React 19)"]
        Browser[User Browser]
        ZustandStore[(Zustand Client Stores)]
        ThreeJS[Three.js / React Three Fiber Canvas]
        Framer[Framer Motion Animations]
    end

    class ClientLayer ui;
    class ZustandStore,ThreeJS,Framer client;

    %% Routing / Portals Layer
    subgraph Portals ["Next.js App Router (Portals)"]
        DashboardPortal[["Dashboard Portal (Student)"]]
        AdminPortal[["Admin Portal (Content)"]]
        CEOPortal[["CEO Portal (Analytics)"]]
        DevPortal[["Developer Portal (Internal)"]]
        
        DashboardPortal --> DashWiki[Wiki]
        DashboardPortal --> DashTesting[Testing Hub]
        DashboardPortal --> DashAnalytics[Analytics]
        DashboardPortal --> Dash3DLab[3D Lab]
        
        AdminPortal --> AdminContent[Articles / Questions CRUD]
        AdminPortal --> AdminTaxonomy[Taxonomy Editor]
        AdminPortal --> AdminReview[SME Review]
    end

    class Portals ui;
    class DashboardPortal,AdminPortal,CEOPortal,DevPortal portal;

    %% Server Actions / Data Fetching
    subgraph ServerLayer ["Next.js Server (RSC)"]
        ServerActions[Server Actions src/lib/actions/]
        Queries[Server Queries src/lib/queries/]
        AuthMiddle[Middleware Auth injection]
        Cron[Vercel Cron Jobs]
    end

    class ServerLayer ui;

    %% Pedagogical Engine
    subgraph PedagogicalEngine ["Core Pedagogical Engine (src/lib/srs)"]
        IRT[IRT 2PL Model]
        Readiness[Readiness Score Vector]
        Blindspot[Blindspot Queue]
        SM2[SM-2 SRS Updates]
    end

    class PedagogicalEngine ui;
    class IRT,Readiness,Blindspot,SM2 engine;

    %% Database & External Services Layer
    subgraph DBLayer ["Supabase & External"]
        Postgres[(PostgreSQL 50+ Tables)]
        Auth[Supabase Auth Session]
        LemonSqueezy[LemonSqueezy / Payrex Billing]
        Anthropic[Anthropic Claude AI Tutor]
    end

    class DBLayer ui;
    class Postgres,Auth data;

    %% Connections
    Browser --> |Navigation & Interactions| AuthMiddle
    AuthMiddle --> Portals
    Browser -.-> |Local State| ZustandStore
    Dash3DLab --> |3D Rendering| ThreeJS
    Portals --> |Animates with| Framer

    %% Data Flow
    Portals --> |Mutations| ServerActions
    Portals --> |Server Components Fetch| Queries
    
    ServerActions --> PedagogicalEngine
    Queries --> PedagogicalEngine

    ServerActions --> Auth
    ServerActions --> Postgres
    Queries --> Postgres
    
    PedagogicalEngine --> |Calculates Mastery| Postgres
    Cron --> |run Daily compute-signals| PedagogicalEngine
    
    AdminPortal --> |Payment triggers| LemonSqueezy
    DashTesting --> |AI Contextual Tutor| Anthropic
```

---

### Legend
1. **Blue (Portals):** The four main applications served by Next.js App Router.
2. **Orange (Pedagogical Engine):** The mathematical / algorithmic core that drives user progression, mastery calculations, and spaced repetition. Includes the Item Response Theory (IRT) model.
3. **Green (Client Technologies):** Specific client-side global state management and complex React ecosystem components handling 3D and rich motion.
4. **Dark (Database/Auth Layer):** Managed by Supabase. Connects seamlessly with the Next.js `middleware.ts` for route protection and RLS configuration.
