'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, ReactNode } from 'react'

const MESSAGES = [
  'Calculating your solar savings...',
  'Fetching solar data for your state...',
  'Checking DISCO tariff rates...',
  'Estimating generator fuel savings...',
  'Sizing your ideal solar system...',
  'Finding verified installers nearby...',
]

export function LoadingScreen({ 
  isVisible, 
  state 
}: { 
  isVisible: boolean
  state?: string 
}) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0)
      setProgress(0)
      return
    }

    const msgInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % MESSAGES.length)
    }, 1200)

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90))
    }, 800)

    return () => {
      clearInterval(msgInterval)
      clearInterval(progressInterval)
    }
  }, [isVisible])

  const currentMessage = state
    ? MESSAGES[messageIndex].replace(
        'your state', state
      )
    : MESSAGES[messageIndex]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex 
            items-center justify-center
            bg-[#F9F8F4]"
        >
          <div className="flex flex-col 
            items-center gap-6 px-8 max-w-sm 
            w-full text-center">
            
            <div className="relative w-24 h-24">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="w-24 h-24 rounded-full
                  border-4 border-primary/20
                  border-t-primary"
              />
              <div className="absolute inset-0 
                flex items-center justify-center
                text-3xl">
                ☀️
              </div>
            </div>

            <div className="text-2xl">🏠</div>

            <div className="h-8">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-gray-600
                    font-medium"
                >
                  {currentMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="w-full h-1.5 
              bg-gray-200 rounded-full 
              overflow-hidden">
              <motion.div
                className="h-full bg-primary 
                  rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>

            <p className="text-xs text-gray-400">
              💡 Lagos households spend an average
              of ₦85,000/month on generator fuel
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CalculatorLoadingWrapper({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [userState, setUserState] = useState<string>("");

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLoading) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    
    const target = e.target as HTMLElement;
    const btn = target.closest('button');
    
    if (btn && btn.textContent?.includes('Calculate My Solar Savings')) {
      if ((e.nativeEvent as MouseEvent & { _isSimulated?: boolean })._isSimulated) return;

      const stateSelect = document.querySelector('select') as HTMLSelectElement;
      if (!stateSelect || !stateSelect.value) {
        return; 
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      setUserState(stateSelect.value);
      setIsLoading(true);
      
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
            const event = new MouseEvent('click', { bubbles: true, cancelable: true });
            (event as MouseEvent & { _isSimulated?: boolean })._isSimulated = true;
            btn.dispatchEvent(event);
        }, 300);
      }, 3000);
    }
  };

  return (
    <div onClickCapture={handleClick}>
      <LoadingScreen isVisible={isLoading} state={userState} />
      {children}
    </div>
  );
}
