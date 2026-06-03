// ── Page & layout transitions ──────────────────────────────────────────────

export const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(2px)' },
  animate: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0, y: -8, filter: 'blur(1px)',
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] }
  },
};

export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export const slideVariants = {
  initial: { x: -16, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { x: -16, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const modalVariants = {
  initial: { scale: 0.92, opacity: 0, y: 12 },
  animate: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { scale: 0.95, opacity: 0, y: 8, transition: { duration: 0.18, ease: 'easeIn' } },
};

export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

export const listContainerVariants = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const listItemVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export const sidebarVariants = {
  open:   { width: 256, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  closed: { width: 72,  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
};

export const notifDropdownVariants = {
  initial: { opacity: 0, scale: 0.95, y: -8, transformOrigin: 'top right' },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.16 } },
};