import React from 'react'

export function Boton({ children, className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors'
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}