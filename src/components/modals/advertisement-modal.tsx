
"use client";

import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AdvertisementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  imageUrl: string;
}

export function AdvertisementModal({ isOpen, onClose, title, description, imageUrl }: AdvertisementModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {imageUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image 
                    src={imageUrl} 
                    alt={title} 
                    fill 
                    className="object-cover" 
                />
            </div>
           )}
        </div>
        <Button onClick={onClose} className="w-full">Close</Button>
      </DialogContent>
    </Dialog>
  );
}
