'use client'

export const DashboardHero = ({ userName = "Philip" }: { userName?: string }) => {
  return (
    <div className="w-full rounded-sm relative h-[200px] shrink-0 mb-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />
      
      {/* Content */}
      <div className="absolute bottom-6 left-6 z-10">
        <h1 className="text-white text-xl md:text-2xl font-medium tracking-tight">
          Hello, {userName}. Are you ready to work today?
        </h1>
      </div>
    </div>
  )
}
