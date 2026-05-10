"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import type { Listing, Bed } from '@/lib/types';
import { DetailsModalWrapper } from './details-modal-wrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, IndianRupee, Home, BedDouble, ChevronLeft, ChevronRight, Lock, MessageSquare, Phone, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyDetailsProps {
  listing: Listing | null;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlock: () => void;
  onChat: () => void;
  onBookInquiry: (listing: Listing, bed: Bed) => void;
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
      <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden border">
      {mediaToShow.map((src, index) => {
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
                <h3 className="text-lg font-semibold text-foreground">See All Photos & Videos</h3>
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

export function PropertyDetails({ listing, onClose, isUnlocked, onUnlock, onChat, onBookInquiry }: PropertyDetailsProps) {
  if (!listing) return null;

  const handleBedClick = (bed: Bed) => {
    if (bed.status === 'vacant') {
        onBookInquiry(listing, bed);
    }
  }

  const rawAmenities = listing.amenities || [];
  const amenitiesList = Array.isArray(rawAmenities) 
    ? rawAmenities 
    : typeof rawAmenities === 'string' 
      ? (rawAmenities as string).split(',').map(s => s.trim()) 
      : [];

  return (
    <DetailsModalWrapper isOpen={!!listing} onClose={onClose} title={listing.title}>
      <div className="space-y-6">
        <MediaGallery listing={listing} isUnlocked={isUnlocked} onUnlock={onUnlock} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
            <IndianRupee className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold text-lg">{listing.rent?.toLocaleString() || '0'}</p>
              <p className="text-muted-foreground">/ month</p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
            <Home className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold text-lg">{listing.size || 'N/A'}</p>
              <p className="text-muted-foreground">Area</p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold text-lg truncate w-[100px] sm:w-[150px]">{listing.locality || 'N/A'}</p>
              <p className="text-muted-foreground">{listing.city || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed">{listing.description || 'No description provided.'}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Amenities</h3>
          {amenitiesList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="text-sm flex items-center gap-2 px-3 py-1">
                  <span>{amenityIcons[amenity] || '✨'}</span>
                  <span>{amenity}</span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border border-dashed">
              No specific amenities listed for this property.
            </p>
          )}
        </div>

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
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact Details</h3>
          <div className="p-4 border rounded-lg relative bg-card shadow-sm">
            {isUnlocked ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                  <span className="text-muted-foreground w-32 flex items-center gap-2"><User className="w-4 h-4"/> Owner:</span>
                  <span className="font-medium">{listing.ownerName || 'Not Provided'}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                  <span className="text-muted-foreground w-32 flex items-center gap-2"><Phone className="w-4 h-4"/> Phone:</span>
                  <span className="font-medium text-primary">
                    {listing.contactPhonePrimary || 'Not Provided'}
                  </span>
                </div>

                {listing.contactPhoneSecondary && listing.contactPhoneSecondary !== 'Hidden' && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="text-muted-foreground w-32 flex items-center gap-2"><Phone className="w-4 h-4"/> Alt Phone:</span>
                    <span className="font-medium">{listing.contactPhoneSecondary}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                  <span className="text-muted-foreground w-32 flex items-center gap-2"><MapPin className="w-4 h-4"/> Address:</span>
                  <span className="font-medium">{listing.completeAddress || listing.partialAddress || 'Not Provided'}</span>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Contact details are visible for 30 days after unlocking.
                  </p>
                </div>
              </div>
            ) : (
              <div className="blur-[4px] select-none space-y-3 opacity-60">
                <div className="flex gap-4"><span className="w-32">Owner:</span><span>**********</span></div>
                <div className="flex gap-4"><span className="w-32">Phone:</span><span>+91 **********</span></div>
                <div className="flex gap-4"><span className="w-32">Address:</span><span>{listing.partialAddress}</span></div>
              </div>
            )}
            
            {!isUnlocked && (
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                <Button onClick={onUnlock} size="lg" className="shadow-lg hover:scale-105 transition-transform">
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock Contact Details
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4">
                {isUnlocked && listing.contactPhonePrimary && !listing.contactPhonePrimary.includes('Hidden') ? (
                    <>
                        <Button size="lg" className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm" asChild>
                            <a href={`https://wa.me/${listing.contactPhonePrimary.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="w-5 h-5 mr-2" /> Chat on WhatsApp
                            </a>
                        </Button>
                        <Button size="lg" variant="outline" className="flex-1 shadow-sm" asChild>
                            <a href={`tel:${listing.contactPhonePrimary.replace(/\D/g, '')}`}>
                                <Phone className="w-5 h-5 mr-2" /> Call Owner
                            </a>
                        </Button>
                    </>
                ) : (
                    <>
                        <Button size="lg" className="flex-1 bg-slate-100 text-slate-400" disabled>
                            <MessageSquare className="w-5 h-5 mr-2" /> WhatsApp Unavailable
                        </Button>
                        <Button size="lg" variant="outline" className="flex-1 text-slate-400" disabled>
                            <Phone className="w-5 h-5 mr-2" /> Call Unavailable
                        </Button>
                    </>
                )}
            </div>
            <Button size="lg" variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={onClose}>
                Close Details
            </Button>
        </div>
      </div>
    </DetailsModalWrapper>
  );
}