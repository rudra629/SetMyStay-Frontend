"use client";

import React from "react";
import type { Listing, RoommateProfile, Page } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Home as HomeIcon, BedDouble } from "lucide-react";
import { PropertyCard } from "@/components/shared/property-card";
import { RoommateCard } from "@/components/shared/roommate-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface HomeSectionProps {
  featuredProperties: Listing[];
  featuredRoommates: RoommateProfile[];
  onViewDetails: (item: Listing | RoommateProfile, type: 'listing' | 'roommate') => void;
  onNavigate: (page: Page) => void;
  likedItemIds: Set<string>;
  onToggleLike: (itemId: string) => void;
  unlockedIds: Set<string>;
}

const features = [
  {
    icon: <BedDouble className="w-8 h-8 text-white" />,
    title: "PG Accommodations",
    description: "Comfortable and modern paying guest options.",
  },
  {
    icon: <HomeIcon className="w-8 h-8 text-white" />,
    title: "Premium Rentals",
    description: "Explore verified rental properties with detailed amenities, photos, and transparent pricing.",
  },
  {
    icon: <Users className="w-8 h-8 text-white" />,
    title: "Find Roommates",
    description: "Connect with compatible roommates based on lifestyle preferences, location, and budget.",
  },
];

export function HomeSection({ 
  featuredProperties, 
  featuredRoommates, 
  onViewDetails, 
  onNavigate,
  likedItemIds,
  onToggleLike,
  unlockedIds,
}: HomeSectionProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <div className="relative isolate rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[50vh] flex items-center justify-center text-center shadow-xl">
        
        {/* Fallback Image */}
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2400&auto=format&fit=crop"
          alt="City skyline" 
          fetchPriority="high" 
          className="absolute inset-0 -z-20 h-full w-full object-cover animate-skyscraper-pan" 
        />
        
        {/* Direct CDN Video for universal support */}
        <video
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-90 animate-skyscraper-pan"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-buildings-on-a-sunny-day-41465-large.mp4" 
            type="video/mp4" 
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-blue-950/60 to-slate-900/75"></div>
        <div className="relative text-white max-w-4xl space-y-5 sm:space-y-6 w-full px-4 py-10 sm:p-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Find Your Perfect<br />Living <span className="bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">Space</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto">
            Discover roommates, rental properties, and PG accommodations with transparent pricing.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
            <Button size="lg" className="w-full sm:w-auto rounded-full bg-background text-primary font-semibold hover:bg-background/90 h-12 px-7" onClick={() => onNavigate('roommates')}>
              <Users className="mr-2 h-5 w-5" /> Find Roommates
            </Button>
            <Button size="lg" className="w-full sm:w-auto rounded-full bg-background text-primary font-semibold hover:bg-background/90 h-12 px-7" onClick={() => onNavigate('rentals')}>
              <HomeIcon className="mr-2 h-5 w-5" /> Browse Rentals
            </Button>
            <Button size="lg" className="w-full sm:w-auto rounded-full bg-background text-primary font-semibold hover:bg-background/90 h-12 px-7" onClick={() => onNavigate('pg')}>
              <BedDouble className="mr-2 h-5 w-5" /> Browse Co-living / PG
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
        {features.map((feature) => (
          <Card key={feature.title} className="text-center p-8 border-none rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
            <CardContent className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
                    {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Properties Section */}
      {featuredProperties.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Properties</h2>
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {featuredProperties.map((listing) => (
                <CarouselItem key={listing.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <PropertyCard
                      listing={listing}
                      onViewDetails={(item) => onViewDetails(item, 'listing')}
                      isLiked={likedItemIds.has(listing.id)}
                      onToggleLike={() => onToggleLike(listing.id)}
                      isUnlocked={unlockedIds.has(listing.id)}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* Featured Roommates Section */}
      {featuredRoommates.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Roommate Profiles</h2>
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {featuredRoommates.map((profile) => (
                <CarouselItem key={profile.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <RoommateCard
                      profile={profile}
                      onViewDetails={(item) => onViewDetails(item, 'roommate')}
                      isLiked={likedItemIds.has(profile.id)}
                      onToggleLike={() => onToggleLike(profile.id)}
                      isUnlocked={unlockedIds.has(profile.id)}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </div>
  );
}