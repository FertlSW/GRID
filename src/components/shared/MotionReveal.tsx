// Kleiner Wrapper: blendet Inhalte sanft ein (fade + gleichzeitiger leichter y-Offset).
// Wird überall eingesetzt, wo Inhalte ruhig auftauchen sollen.

import { motion, type HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionRevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
  y?: number
}

export function MotionReveal({
  children,
  delay = 0,
  y = 8,
  ...rest
}: MotionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
