
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/types";
import { MapPin, IndianRupee, Home, Eye, BedDouble, Heart, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
  isLiked: boolean;
  onToggleLike: () => void;
  isUnlocked: boolean;
}

export function PropertyCard({ listing, onViewDetails, isLiked, onToggleLike, isUnlocked }: PropertyCardProps) {

  const handleLikeClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click event from firing
      onToggleLike();
  };

  const images = listing.images || [];

  return (
    <div 
      className="bg-card rounded-xl shadow-md overflow-hidden border border-transparent hover:border-primary/50 hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
      onClick={() => onViewDetails(listing)}
    >
      <div className="relative h-48 w-full flex-shrink-0">
        {images.length > 0 ? (
          <Image
            src={images[0]}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Home className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <Badge variant="secondary" className="absolute top-3 left-3">
          {listing.propertyType === 'PG' ? <BedDouble className="w-3 h-3 mr-1.5" /> : <Home className="w-3 h-3 mr-1.5" />}
          {listing.propertyType}
        </Badge>
        <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white"
            onClick={handleLikeClick}
        >
            <Heart className={cn("w-5 h-5 text-slate-600 transition-all", isLiked && "text-red-500 fill-red-500")} />
            <span className="sr-only">Like property</span>
        </Button>
      </div>
      <div className="p-4 space-y-3 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-card-foreground truncate group-hover:text-primary">{listing.title}</h3>
        
        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{listing.partialAddress}</span>
        </div>
        
        <div className="flex items-center text-lg font-bold text-primary">
          <IndianRupee className="w-5 h-5 mr-1" />
          <span>{listing.rent.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ month</span></span>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs">
          {listing.furnishedStatus && <Badge variant="outline">{listing.furnishedStatus}</Badge>}
          {listing.size && <Badge variant="outline">{listing.size}</Badge>}
          {Array.isArray(listing.amenities) && listing.amenities.slice(0, 1).map(amenity => (
            <Badge key={amenity} variant="outline">{amenity}</Badge>
          ))}
        </div>

        <div className="mt-auto pt-4">
            <Button variant="default" size="sm" className="w-full">
                {isUnlocked && <CheckCircle className="w-4 h-4 mr-2" />}
                {isUnlocked ? 'View Unlocked Details' : 'View Details'}
            </Button>
        </div>
      </div>
    </div>
  );
}
