'use client'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        width: 36,
        height: 20,
        borderRadius: 10,
        backgroundColor: checked ? '#1B3FC4' : '#D4DAE3',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 150ms ease-out',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'left 150ms ease-out',
        }}
      />
    </button>
  )
}
