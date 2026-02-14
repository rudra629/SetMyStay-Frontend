
'use client';

import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

interface FloatingCtaProps {
    onGameClick: () => void;
}

export function FloatingCta({ onGameClick }: FloatingCtaProps) {
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button 
                onClick={onGameClick} 
                size="icon" 
                className="rounded-full bg-amber-500 hover:bg-amber-600 text-white w-16 h-16 shadow-xl flex items-center justify-center"
            >
                <Gift className="w-8 h-8" />
                <span className="sr-only">Play to Win</span>
            </Button>
        </div>
    );
}
