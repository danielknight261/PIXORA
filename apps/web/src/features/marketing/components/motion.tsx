"use client";

import {
  motion,
  useReducedMotion as useFramerReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";

export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const viewportOnce = { once: true, margin: "-80px" } as const;

export function useReducedMotion() {
  return useFramerReducedMotion() ?? false;
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: premiumEase },
  },
};

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "visible"}
      viewport={viewportOnce}
      variants={{
        hidden: { opacity: 0, y: reducedMotion ? 0 : 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: reducedMotion ? 0 : 0.6, ease: premiumEase, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "visible"}
      viewport={viewportOnce}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reducedMotion
          ? { hidden: {}, visible: {} }
          : fadeUpVariants
      }
    >
      {children}
    </motion.div>
  );
}

export function HeroStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : "hidden"}
      animate={reducedMotion ? undefined : "visible"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.12,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reducedMotion
          ? { hidden: {}, visible: {} }
          : fadeUpVariants
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function HeroImage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reducedMotion
          ? false
          : { opacity: 0, scale: 0.96 }
      }
      animate={
        reducedMotion
          ? undefined
          : { opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.8, ease: premiumEase, delay: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
