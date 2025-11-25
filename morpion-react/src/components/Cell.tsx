import React from 'react'
import type { CellValue } from '../types'

export default function Cell({
  value,
  onClick,
  highlight = false,
  className = ""
}: {
  value: CellValue;
  onClick: () => void;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`cell ${highlight ? 'cell-highlight' : ''} ${className}`}
      onClick={onClick}
    >
      {value === 'X' && <img src="/src/assets/x.svg" alt="X" />}
      {value === 'O' && <img src="/src/assets/o.svg" alt="O" />}
    </button>
  )
}
