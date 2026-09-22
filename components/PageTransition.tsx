"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex-1 flex flex-col w-full"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

