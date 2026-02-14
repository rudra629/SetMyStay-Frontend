
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import type { Listing, Bed } from '@/lib/types';
import { DetailsModalWrapper } from './details-modal-wrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, IndianRupee, Home, Eye, BedDouble, ChevronLeft, ChevronRight, Lock, MessageSquare, Phone, PlayCircle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PropertyDetailsProps {
  listing: Listing | null;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlock: () => void;
  onChat: () => void;
  onBookInquiry: (listing: Listing, bed: Bed) => void;
  onCheckAvailability: (listing: Listing) => void;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  'AC': '❄️',
  'WiFi': '📶',
  'Parking': '🅿️',
  'Gym': '🏋️',
  'Pool': '🏊',
  'Elevator': '🛗',
  'Security': '🛡️',
  'Balcony': '🏞️',
  'Power Backup': '🔋',
  'Meals': '🍲',
  'Laundry': '🧺',
  'Housekeeping': '🧹',
  'Garden': '🌳',
};

const MediaGallery = ({ listing, isUnlocked, onUnlock }: { listing: Listing; isUnlocked: boolean; onUnlock: () => void; }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages = listing.images || [];
  const allMedia = [...allImages, ...(listing.videoUrl ? [listing.videoUrl] : [])];
  const hasMoreMedia = allMedia.length > 2;

  // If not unlocked, show only up to 2 images. If there are more media, add a placeholder to unlock.
  const mediaToShow = isUnlocked
    ? allMedia
    : hasMoreMedia
      ? [...allImages.slice(0, 2), 'unlock_placeholder']
      : allImages.slice(0, 2);

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaToShow.length);
  };
  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaToShow.length) % mediaToShow.length);
  };

  if (mediaToShow.length === 0) {
    return (
      <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
        <p>No media available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
      {mediaToShow.map((src, index) => {
        // The placeholder slide
        if (src === 'unlock_placeholder') {
          return (
            <div
              key="unlock-placeholder"
              className={`absolute inset-0 bg-slate-300 transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              {allImages.length > 1 && (
                <Image src={allImages[1]} alt="Blurred background" fill className="object-cover filter blur-md scale-110" />
              )}
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg text-center p-4">
                <h3 className="text-lg font-semibold">See All Photos & Videos</h3>
                <p className="text-muted-foreground mb-4">Unlock details to view all media for this property.</p>
                <Button onClick={onUnlock}>
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock to View All
                </Button>
              </div>
            </div>
          )
        }
        
        const isVideo = listing.videoUrl && src === listing.videoUrl;
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            {isVideo ? (
              // This part is only reachable if isUnlocked is true
              <video src={src as string} controls className="w-full h-full object-contain bg-black" />
            ) : (
              <Image src={src as string} alt={`${listing.title} media ${index + 1}`} fill className="object-cover" />
            )}
          </div>
        );
      })}
      
      {mediaToShow.length > 1 && (
        <>
          <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" onClick={prevMedia}>
            <ChevronLeft />
          </Button>
          <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" onClick={nextMedia}>
            <ChevronRight />
          </Button>
        </>
      )}
    </div>
  );
};


export function PropertyDetails({ listing, onClose, isUnlocked, onUnlock, onChat, onBookInquiry, onCheckAvailability }: PropertyDetailsProps) {
  if (!listing) return null;

  const handleBedClick = (bed: Bed) => {
    if (bed.status === 'vacant') {
        onBookInquiry(listing, bed);
    }
  }

  return (
    <DetailsModalWrapper isOpen={!!listing} onClose={onClose} title={listing.title}>
      <div className="space-y-6">
        <MediaGallery listing={listing} isUnlocked={isUnlocked} onUnlock={onUnlock} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
            <IndianRupee className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold text-lg">{listing.rent.toLocaleString()}</p>
              <p className="text-muted-foreground">/ month</p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
            <Home className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold text-lg">{listing.size}</p>
              <p className="text-muted-foreground">{listing.area} sq ft</p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold text-lg">{listing.locality}</p>
              <p className="text-muted-foreground">{listing.city}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{listing.description}</p>
        </div>

        {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map(amenity => (
                <Badge key={amenity} variant="secondary" className="text-sm flex items-center gap-2">
                  <span>{amenityIcons[amenity] || '✅'}</span>
                  <span>{amenity}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {listing.propertyType === 'PG' && Array.isArray(listing.beds) && listing.beds.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Room Layout</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
              {listing.beds.map((bed) => (
                <button
                  key={bed.id}
                  onClick={() => handleBedClick(bed)}
                  disabled={bed.status === 'occupied'}
                  className={cn(
                    "p-4 rounded-lg flex flex-col items-center justify-center transition-transform transform hover:scale-105",
                    bed.status === 'vacant' 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 cursor-not-allowed opacity-70',
                  )}
                >
                  <BedDouble className="w-8 h-8" />
                  <span className="mt-2 text-sm font-semibold capitalize">{bed.status}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className='space-y-4 border-t pt-6'>
            <Button size="lg" variant="secondary" className="w-full" onClick={() => onCheckAvailability(listing)}>
                <CheckCircle className="w-5 h-5 mr-2" /> Check Availability
            </Button>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <Clock className="w-3 h-3"/>
                Availability last updated: {formatDistanceToNow(new Date(listing.lastAvailabilityCheck), { addSuffix: true })}
            </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact Details</h3>
          <div className="p-4 border rounded-lg relative bg-card">
            {isUnlocked ? (
              <div className="space-y-2">
                <p><strong>Owner:</strong> {listing.ownerName}</p>
                <p><strong>Primary Phone:</strong> {listing.contactPhonePrimary}</p>
                {listing.contactPhoneSecondary && <p><strong>Secondary Phone:</strong> {listing.contactPhoneSecondary}</p>}
                <p><strong>Email:</strong> {listing.contactEmail || 'Not provided'}</p>
                <p><strong>Address:</strong> {listing.completeAddress}</p>
                <p className="text-xs text-muted-foreground pt-2">Contact details are visible for 30 days after unlocking.</p>
              </div>
            ) : (
              <div className="blur-sm select-none">
                <p><strong>Owner:</strong> ************</p>
                <p><strong>Primary Phone:</strong> **********</p>
                <p><strong>Secondary Phone:</strong> **********</p>
                <p><strong>Email:</strong> *****@*****.com</p>
                <p><strong>Address:</strong> {listing.partialAddress}</p>
              </div>
            )}
            {!isUnlocked && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <Button onClick={onUnlock}>
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock Details
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1" onClick={onChat} disabled={!isUnlocked}>
                    <MessageSquare className="w-5 h-5 mr-2" /> Chat with Owner
                </Button>
                <a href={`tel:${listing.contactPhonePrimary}`} className="flex-1">
                    <Button size="lg" variant="outline" className="w-full" disabled={!isUnlocked}>
                        <Phone className="w-5 h-5 mr-2" /> Call Owner
                    </Button>
                </a>
            </div>
             <Button size="lg" variant="ghost" className="w-full" onClick={onClose}>
                Close
            </Button>
        </div>
      </div>
    </DetailsModalWrapper>
  );
}
