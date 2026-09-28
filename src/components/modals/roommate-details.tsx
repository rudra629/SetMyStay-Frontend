"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import type { RoommateProfile } from '@/lib/types';
import { DetailsModalWrapper } from './details-modal-wrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, IndianRupee, User, Eye, Cake, ChevronLeft, ChevronRight, Lock, MessageSquare, Phone, Sparkles, CigaretteOff, Leaf, Drumstick, Utensils, PawPrint } from 'lucide-react';

interface RoommateDetailsProps {
  profile: RoommateProfile | null;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlock: () => void;
  onChat: () => void;
}

const preferenceIcons: { [key: string]: React.ReactNode } = {
  'Non-Smoker': '🚭',
  'Vegetarian': '🥗',
  'Non-Vegetarian': '🍗',
  'Clean': '✨',
  'Drinker': '🍻',
  'Pet-Friendly': '🐾',
};

const MediaGallery = ({ profile }: { profile: RoommateProfile }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const media = profile.images || [];
  
    const nextMedia = () => setCurrentIndex((prev) => (prev + 1) % media.length);
    const prevMedia = () => setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  
    if (media.length === 0) {
      return (
        <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
            <User className="w-16 h-16 text-muted-foreground" />
        </div>
      );
    }
  
    return (
      <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
        {media.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            {/* Cloud Video Support */}
            {src.match(/\.(mp4|webm|ogg|mov|mkv|m4v)/i) ? (
                 <video src={src as string} controls controlsList="nodownload" className="w-full h-full object-contain bg-black" />
             ) : (
                <Image src={src as string} alt={`${profile.ownerName} media ${index + 1}`} fill className="object-cover" />
             )}
          </div>
        ))}
        {media.length > 1 && (
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
  
export function RoommateDetails({ profile, onClose, isUnlocked, onUnlock, onChat }: RoommateDetailsProps) {
  if (!profile) return null;

  // 👇 Robust parsing to fix the ["Amenities"] formatting bug
  let preferencesList: string[] = [];
  if (profile.preferences) {
      if (Array.isArray(profile.preferences)) {
          // If Django sent an array containing a single stringified JSON array
          if (profile.preferences.length === 1 && typeof profile.preferences[0] === 'string' && profile.preferences[0].startsWith('[')) {
              try {
                  preferencesList = JSON.parse(profile.preferences[0]);
              } catch (e) {
                  preferencesList = profile.preferences;
              }
          } else {
              preferencesList = profile.preferences;
          }
      } else if (typeof profile.preferences === 'string') {
          try {
              if (profile.preferences.startsWith('[')) {
                  preferencesList = JSON.parse(profile.preferences);
              } else {
                  preferencesList = profile.preferences.split(',').map(s => s.trim());
              }
          } catch (e) {
              preferencesList = profile.preferences.split(',').map(s => s.trim());
          }
      }
  }
  // Fallback cleanup to strip out any remaining quotes or brackets
  preferencesList = preferencesList.map(pref => pref.replace(/["\[\]]/g, '').trim());

  return (
    <DetailsModalWrapper isOpen={!!profile} onClose={onClose} title={`${profile.ownerName}'s Profile`}>
       <div className="space-y-6">
        <MediaGallery profile={profile} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
            <IndianRupee className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold text-lg">{profile.rent?.toLocaleString()}</p>
              <p className="text-muted-foreground">{profile.hasProperty ? 'Monthly Rent' : 'Target Budget'}</p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
            <Cake className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold text-lg">{profile.age || 'N/A'} years</p>
              <p className="text-muted-foreground">{profile.gender || 'Any'}</p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold text-lg">{profile.locality}</p>
              <p className="text-muted-foreground">{profile.city}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">About Me</h3>
          <p className="text-muted-foreground">{profile.description || 'No description provided.'}</p>
        </div>

        {preferencesList.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Lifestyle Preferences</h3>
            <div className="flex flex-wrap gap-2">
              {preferencesList.map(preference => (
                <Badge key={preference} variant="secondary" className="text-sm flex items-center gap-2">
                  <span>{preferenceIcons[preference] || '👍'}</span>
                  <span>{preference}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact Details</h3>
          <div className="p-4 border rounded-lg relative bg-card">
            {isUnlocked ? (
              <div className="space-y-2">
                <p><strong>Name:</strong> {profile.ownerName}</p>
                <p><strong>Primary Phone:</strong> {profile.contactPhonePrimary}</p>
                {profile.contactPhoneSecondary && <p><strong>Secondary Phone:</strong> {profile.contactPhoneSecondary}</p>}
                <p><strong>Email:</strong> {profile.contactEmail || 'Not provided'}</p>
                
                {/* 👇 FIX: Show Full Address if they HAVE a property */}
                {profile.hasProperty && profile.completeAddress && (
                    <p><strong>Property Address:</strong> {profile.completeAddress}</p>
                )}
                
                 <p className="text-xs text-muted-foreground pt-2">Contact details are visible for 30 days after unlocking.</p>
              </div>
            ) : (
              <div className="blur-sm select-none">
                <p><strong>Name:</strong> ************</p>
                <p><strong>Primary Phone:</strong> **********</p>
                <p><strong>Secondary Phone:</strong> **********</p>
                <p><strong>Email:</strong> *****@*****.com</p>
                {profile.hasProperty && <p><strong>Property Address:</strong> ********************</p>}
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

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={onChat} disabled={!isUnlocked}>
            <MessageSquare className="w-5 h-5 mr-2" /> Chat on WhatsApp
          </Button>
          <a href={`tel:${profile.contactPhonePrimary}`} className="flex-1 pointer-events-none">
            <Button size="lg" variant="outline" className="w-full pointer-events-auto" disabled={!isUnlocked}>
                <Phone className="w-5 h-5 mr-2" /> Call
            </Button>
          </a>
          <Button size="lg" variant="ghost" className="flex-1" onClick={onClose}>
                Close
           </Button>
        </div>
      </div>
    </DetailsModalWrapper>
  );
}