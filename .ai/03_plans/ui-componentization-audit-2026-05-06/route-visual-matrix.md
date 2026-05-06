# Route Visual Matrix

Use this matrix during browser visual inspection. Inspect only affected route subsets per batch; run broader matrix near final regression.

## Public / marketing
- `/`
- `/pricing`
- `/about`
- `/contact`
- `/tools`
- `/try`
- `/login`
- `/register`

## Dashboard shell
- `/dashboard`
- `/dashboard/quiz`
- `/dashboard/wiki`
- `/dashboard/3d-lab`
- `/dashboard/settings`

## Wiki / learning
- `/dashboard/wiki`
- One known valid article route from seeded/local data.
- Wiki quiz/review modal open state when applicable.

## Quiz
- Quiz setup/hub route.
- Active quiz session route when fixture/demo data is available.
- Confirmation modal open states.
- Results/calculating/microbreak overlays when touched.

## Admin / developer / CEO
- `/admin`
- `/admin/knowledge`
- `/admin/ai-audit`
- `/developer`
- `/developer/status`
- CEO route if demo auth permits.

## 3D Lab
- `/dashboard/3d-lab`
- Lab browser/module route where available.
- Onboarding/bottom sheet open states if touched.

## Required viewport checks
- Desktop: 1440x900 or equivalent.
- Laptop: 1280x800 when layout density matters.
- Mobile: 390x844 or equivalent.

## Required state checks
- Default loaded state.
- Loading/skeleton state when fixtureable.
- Empty state when fixtureable.
- Error/not-found state when route supports it.
- Dialog/sheet/popover open state when touched.
- Keyboard focus state for interactive controls.
