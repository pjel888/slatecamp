'use client'

import { lazy, Suspense, type ComponentType } from 'react'

type DynamicOptions = {
  loading?: ComponentType<any>
  ssr?: boolean
}

const resolveComponent = <TProps,>(
  componentOrModule: ComponentType<TProps> | { default: ComponentType<TProps> },
) =>
  'default' in componentOrModule
    ? componentOrModule.default
    : componentOrModule

const dynamic = <TProps extends object>(
  loader: () => Promise<ComponentType<TProps> | { default: ComponentType<TProps> }>,
  options: DynamicOptions = {},
) => {
  const LazyComponent = lazy(async () => {
    const loaded = await loader()

    return {
      default: resolveComponent<TProps>(loaded),
    }
  })

  const DynamicComponent = (props: TProps) => {
    const LoadingComponent = options.loading

    return (
      <Suspense fallback={LoadingComponent ? <LoadingComponent /> : null}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }

  DynamicComponent.displayName = 'StorybookNextDynamic'

  return DynamicComponent
}

export default dynamic
