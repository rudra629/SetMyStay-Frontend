
"use client";

import React from "react";
import type { Listing, RoommateProfile, Page } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Home as HomeIcon, BedDouble } from "lucide-react";
import { PropertyCard } from "@/components/shared/property-card";
import { RoommateCard } from "@/components/shared/roommate-card";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden min-h-[50vh] flex items-center justify-center text-center -mx-4 sm:-mx-6 lg:-mx-8">
        <Image
          src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop"
          alt="Modern living room"
          fill
          className="object-cover -z-10"
          priority
        />
        <div className="absolute inset-0 bg-blue-800/60 backdrop-brightness-75"></div>
        <div className="relative text-white max-w-4xl space-y-6 w-full p-8 mx-4 sm:mx-8 rounded-xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
            Find Your Perfect Living Space
          </h1>
          <p className="text-lg sm:text-xl text-slate-200">
            Discover roommates, rental properties, and PG accommodations with transparent pricing.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" variant="secondary" onClick={() => onNavigate('roommates')}>
              <Users className="mr-2 h-5 w-5" /> Find Roommates
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onNavigate('rentals')}>
              <HomeIcon className="mr-2 h-5 w-5" /> Browse Rentals
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onNavigate('pg')}>
              <BedDouble className="mr-2 h-5 w-5" /> Browse Co-living / PG
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card key={feature.title} className="text-center p-8 border-none shadow-lg hover:shadow-xl transition-shadow">
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
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Properties</h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
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

      {/* Featured Roommates Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Roommate Profiles</h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
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
    </div>
  );
}
