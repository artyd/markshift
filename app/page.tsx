'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { HomePage }      from '@/components/pages/HomePage';
import { ConverterPage } from '@/components/pages/ConverterPage';
import { EditorPage }    from '@/components/pages/EditorPage';
import { ReaderPage }    from '@/components/pages/ReaderPage';

type Page = 'home' | 'converter' | 'editor' | 'reader';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigate = (page: Page) => setCurrentPage(page);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'hsl(var(--background))',
    }}>

      <Header currentPage={currentPage} onNavigate={navigate} />

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: 'absolute', inset: 0 }}
          >
            {currentPage === 'home'      && <HomePage      onNavigate={navigate} />}
            {currentPage === 'converter' && <ConverterPage />}
            {currentPage === 'editor'    && <EditorPage />}
            {currentPage === 'reader'    && <ReaderPage />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
