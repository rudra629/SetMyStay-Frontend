import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SetMyStay — Find Your Perfect Living Space" },
      { name: "description", content: "Browse PGs, rentals and roommate listings. Unlock owner contact details, list your property, and find your perfect living space with SetMyStay." },
      { property: "og:title", content: "SetMyStay — Find Your Perfect Living Space" },
      { property: "og:description", content: "Browse PGs, rentals and roommate listings. Unlock owner contact details, list your property, and find your perfect living space with SetMyStay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

import React, { useState, useEffect, useCallback } from "react";
import type { Listing, RoommateProfile, Page, ListingType, UnlockPlan, Bed, Advertisement, Coupon, Purchase, AnyListing, PricingData } from "@/lib/types";
import { defaultPricing } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { getProperties, toggleFavoriteProperty, getCoupons, getAdvertisements, createListing } from "@/lib/api";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomeSection } from "@/components/sections/home-section";
import { ListingsSection } from "@/components/sections/listings-section";

import { PropertyDetails } from "@/components/modals/property-details";
import { RoommateDetails } from "@/components/modals/roommate-details";
import { UnlockDetailsModal } from "@/components/modals/unlock-details-modal";
import { ListPropertyPaymentModal } from "@/components/modals/list-property-payment-modal";
import { AuthModal } from "@/components/modals/auth-modal";
import { ChatModal } from "@/components/modals/chat-modal";
import { LoadingSpinner } from "@/components/icons";
import { RateUsModal } from "@/components/modals/rate-us-modal";
import { BookingInquiryModal } from "@/components/modals/booking-inquiry-modal";
import { FloatingCta } from "@/components/shared/floating-cta";
import { AdvertisementModal } from "@/components/modals/advertisement-modal";
import { PaymentConfirmationModal } from "@/components/modals/payment-confirmation-modal";
import { SlotMachineModal } from "@/components/modals/slot-machine-modal";
import { ContactFab } from "@/components/shared/contact-fab";
import { HistoryModal } from "@/components/modals/history-modal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getFromLocalStorage, saveToLocalStorage } from "@/lib/storage";

const defaultUserState = {
  unlocks: { count: 0, isUnlimited: false, unlockedIds: new Set<string>() },
  purchaseHistory: [] as Purchase[],
  likedItemIds: new Set<string>(),
};

function Home() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [allRoommates, setAllRoommates] = useState<RoommateProfile[]>([]);
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProperties, setFeaturedProperties] = useState<Listing[]>([]);
  const [featuredRoommates, setFeaturedRoommates] = useState<RoommateProfile[]>([]);
  const [isClient, setIsClient] = useState(false);

  const [selectedItem, setSelectedItem] = useState<{ type: 'listing' | 'roommate'; data: AnyListing } | null>(null);
  const [itemToUnlock, setItemToUnlock] = useState<{ type: 'listing' | 'roommate'; data: AnyListing } | null>(null);
  const [isUnlockModalOpen, setUnlockModalOpen] = useState(false);
  const [isListPaymentModalOpen, setListPaymentModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [isRateUsModalOpen, setRateUsModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [chattingWith, setChattingWith] = useState<string | null>(null);

  const [unlocks, setUnlocks] = useState(defaultUserState.unlocks);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [likedItems, setLikedItems] = useState<(Listing | RoommateProfile)[]>([]);
  const [myProperties, setMyProperties] = useState<(Listing | RoommateProfile)[]>([]);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [inquiryData, setInquiryData] = useState<{ listing: Listing; bed: Bed } | null>(null);
  const [pendingListingData, setPendingListingData] = useState<any>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authActionRequired, setAuthActionRequired] = useState<string | null>(null);

  const [adToShow, setAdToShow] = useState<Advertisement | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  const [isPaymentConfirmationOpen, setIsPaymentConfirmationOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{ planName: string; amount: number; onConfirm: () => void; } | null>(null);

  const [isSlotMachineModalOpen, setIsSlotMachineModalOpen] = useState(false);
  const [isUnlockConfirmationOpen, setUnlockConfirmationOpen] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const hasToken = !!localStorage.getItem('access_token');
      const loggedInStatus = getFromLocalStorage('setmystay_isLoggedIn', false) || hasToken;
      setIsLoggedIn(loggedInStatus);
      
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const allData = await getProperties();

          const realProperties = allData.filter(p => (p.propertyType as string) !== 'Roommate');
          const rawRoommates = allData.filter(p => (p.propertyType as string) === 'Roommate');

          const realRoommates: RoommateProfile[] = rawRoommates.map(listing => ({
            id: listing.id,
            propertyType: 'Roommate',
            ownerName: listing.title,
            age: 25, 
            rent: listing.rent,
            city: listing.city,
            locality: listing.locality,
            state: listing.state,
            completeAddress: listing.completeAddress,
            partialAddress: listing.partialAddress,
            contactPhonePrimary: listing.contactPhonePrimary,
            description: listing.description || `Looking for roommate in ${listing.locality}`,
            preferences: listing.amenities || [], 
            gender: 'Any', 
            images: listing.images?.length ? listing.images : ['https://placehold.co/400x400'],
            views: listing.views,
            ownerId: listing.ownerId,
            hasProperty: true, 
            status: listing.status as any,
            submittedAt: listing.submittedAt
          }));

          setAllListings(realProperties);
          setAllRoommates(realRoommates);

          const shuffledListings = [...realProperties].sort(() => 0.5 - Math.random());
          const shuffledRoommates = [...realRoommates].sort(() => 0.5 - Math.random());
          setFeaturedProperties(shuffledListings.slice(0, 3));
          setFeaturedRoommates(shuffledRoommates.filter(r => r.hasProperty).slice(0, 3));

          const liveCoupons = await getCoupons();
          setActiveCoupons(liveCoupons);

          const liveAds = await getAdvertisements();
          const adShownInSession = sessionStorage.getItem('setmystay_ad_shown');
          const activeAd = liveAds.find((ad: Advertisement) => ad.isActive);
          
          if (activeAd && !adShownInSession) {
              setAdToShow(activeAd);
              setIsAdModalOpen(true);
              sessionStorage.setItem('setmystay_ad_shown', 'true');
          }

        } catch (error) {
          console.error("Failed to load data", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData(); 
      
      setPricing(getFromLocalStorage('pricing', defaultPricing));
      
      const allUserData: any = getFromLocalStorage('setmystay_user_data', {});
      const userData = loggedInStatus ? (allUserData.defaultUser || defaultUserState) : defaultUserState;
      
      setUnlocks({
          count: userData.unlocks?.count || 0,
          isUnlimited: userData.unlocks?.isUnlimited || false,
          unlockedIds: new Set(userData.unlocks?.unlockedIds || []),
      });
      setPurchaseHistory((userData.purchaseHistory || []).map((p: any) => ({...p, date: new Date(p.date)})));
      
      const currentLikedIds = new Set<string>(userData.likedItemIds || []);
      setLikedItemIds(currentLikedIds);
    }
  }, [isClient]);

  const saveUserData = useCallback(() => {
    if (isLoggedIn && isClient) {
      const allUserData: any = getFromLocalStorage('setmystay_user_data', {});
      const currentUserData = allUserData.defaultUser || {};
      const updatedData = { 
        ...currentUserData, 
        unlocks: {
            count: unlocks.count,
            isUnlimited: unlocks.isUnlimited,
            unlockedIds: Array.from(unlocks.unlockedIds),
        },
        purchaseHistory: purchaseHistory,
        likedItemIds: Array.from(likedItemIds),
      };
      saveToLocalStorage('setmystay_user_data', { defaultUser: updatedData });
    }
  }, [isLoggedIn, isClient, unlocks, purchaseHistory, likedItemIds]);

  useEffect(() => {
    if (isClient) {
      saveUserData();
    }
  }, [isClient, saveUserData]);
  
  useEffect(() => {
    if (authActionRequired) {
      toast({
        title: "Authentication Required",
        description: `Please sign in to ${authActionRequired}.`,
      });
      setAuthModalOpen(true);
      if (authActionRequired === 'list your property') {
        sessionStorage.setItem('setmystay_intended_page', 'list');
      }
    }
  }, [authActionRequired, toast]);

  useEffect(() => {
    const allAvailableItems = [...allListings, ...allRoommates];
    const newlyLikedItems = allAvailableItems.filter(item => likedItemIds.has(item.id));
    setLikedItems(newlyLikedItems);
  }, [likedItemIds, allListings, allRoommates]);

  const handleNavigate = (page: Page) => {
    setActivePage(page);
  };

  const handleRateUsClose = (rated: boolean) => {
    setRateUsModalOpen(false);
  };
  
  const useUnlock = useCallback((itemId: string) => {
    let success = false;
    let newCount: number | undefined;
    setUnlocks(currentUnlocks => {
        if (currentUnlocks.isUnlimited) {
            success = true;
            return {
                ...currentUnlocks,
                unlockedIds: new Set(currentUnlocks.unlockedIds).add(itemId),
            };
        }
        if (currentUnlocks.count > 0) {
            success = true;
            newCount = currentUnlocks.count - 1;
            return {
                ...currentUnlocks,
                count: newCount,
                unlockedIds: new Set(currentUnlocks.unlockedIds).add(itemId),
            };
        }
        return currentUnlocks;
    });
    
    if (success && newCount !== undefined) {
        toast({
            title: "Details Unlocked!",
            description: `You have ${newCount} unlocks remaining.`,
        });
    }
    
    return success;
  }, [toast]);
  
  const handleUnlockPurchase = useCallback((plan: UnlockPlan, planName: string, amount: number) => {
    setUnlocks(currentUnlocks => {
      const newUnlocksState = { ...currentUnlocks };
      if (plan === 'unlimited') {
        newUnlocksState.isUnlimited = true;
      } else {
        newUnlocksState.count += plan;
      }
      return newUnlocksState;
    });

    const newPurchase: Purchase = { id: `purchase_${Date.now()}`, planName, amount, date: new Date() };

    setPurchaseHistory(currentHistory => {
        const updated = [newPurchase, ...currentHistory];
        try {
          localStorage.setItem('setmystay_purchase_history', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
    });

    toast({
      title: "Purchase Successful!",
      description: plan === 'unlimited' ? "You now have unlimited unlocks." : `You've added ${plan} unlocks.`,
      variant: "default",
    });

    setTimeout(() => {
        if (itemToUnlock) {
            setSelectedItem(itemToUnlock);
            setItemToUnlock(null);
        } else {
            setRateUsModalOpen(true);
        }
    }, 300);
  }, [toast, itemToUnlock]);

  const handleViewDetails = (item: AnyListing, type: 'listing' | 'roommate') => {
    setSelectedItem({ type, data: item });
  };
  
  const handleConfirmUnlock = () => {
    if (selectedItem?.data.id) {
      if (useUnlock(selectedItem.data.id)) {
        handleViewDetails(selectedItem.data, selectedItem.type);
      }
    }
    setUnlockConfirmationOpen(false);
  };

  const handleUnlockClick = () => {
    if (!isLoggedIn) {
        setAuthActionRequired('unlock details');
        return;
    }
    if (selectedItem) {
        if (unlocks.isUnlimited || unlocks.count > 0) {
            setUnlockConfirmationOpen(true);
        } else {
            setItemToUnlock(selectedItem);
            setSelectedItem(null); 
            setUnlockModalOpen(true);
        }
    }
  };
  
  const handleToggleLike = async (itemId: string) => {
    if (!isLoggedIn) {
        setAuthActionRequired('like items');
        return;
    }
    
    setLikedItemIds(currentSet => {
        const newSet = new Set(currentSet);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else {
            newSet.add(itemId);
        }
        return newSet;
    });

    try {
        await toggleFavoriteProperty(itemId);
    } catch (error) {
        toast({ title: "Error", description: "Failed to save favorite.", variant: "destructive" });
        setLikedItemIds(currentSet => {
            const newSet = new Set(currentSet);
            newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);
            return newSet;
        });
    }
  };

  const handleInitiateListing = (data: any) => {
    if (!isLoggedIn) {
        setAuthActionRequired('list a property');
        return;
    }
    setPendingListingData(data);
    setListPaymentModalOpen(true);
  };

  const handleListProperty = async () => {
    if (!pendingListingData) return;
    setListPaymentModalOpen(false);
    
    let partialAddress = `${pendingListingData.locality}, ${pendingListingData.city}`;
    if (pendingListingData.sector) {
      partialAddress = `${pendingListingData.sector}, ${pendingListingData.locality}, ${pendingListingData.city}`;
    }

    try {
        const formData = new FormData();
        formData.append('title', pendingListingData.title || pendingListingData.ownerName);
        formData.append('owner_name', pendingListingData.ownerName);
        formData.append('rent', pendingListingData.rent.toString());
        formData.append('city', pendingListingData.city);
        formData.append('area', pendingListingData.locality);
        formData.append('address', pendingListingData.address);
        formData.append('phone_primary', pendingListingData.phonePrimary);
        
        if (pendingListingData.phoneSecondary) {
            formData.append('phone_secondary', pendingListingData.phoneSecondary);
        }
        if (pendingListingData.description) {
            formData.append('description', pendingListingData.description);
        }

        if ('propertyType' in pendingListingData && pendingListingData.propertyType !== 'Roommate') {
            formData.append('property_type', pendingListingData.propertyType === 'Rental' ? 'RENTAL' : 'PG');
            formData.append('sq_ft', pendingListingData.area?.toString() || '0');
            formData.append('is_broker', pendingListingData.brokerStatus === 'broker' ? 'true' : 'false');
            
            if (pendingListingData.amenities) {
                const amenitiesString = Array.isArray(pendingListingData.amenities) 
                    ? pendingListingData.amenities.join(',') 
                    : pendingListingData.amenities;
                formData.append('amenities_list', amenitiesString);
            }
        } else {
            formData.append('property_type', 'ROOMMATE');
            formData.append('budget', pendingListingData.rent.toString());
            formData.append('location_preference', partialAddress);
        }

        if (pendingListingData.images) {
            pendingListingData.images.forEach((file: File) => {
                formData.append(`uploaded_images`, file);
            });
        }
        if (pendingListingData.aadhaarCard) formData.append('document_aadhaar', pendingListingData.aadhaarCard);
        if (pendingListingData.electricityBill) formData.append('document_electricity', pendingListingData.electricityBill);
        if (pendingListingData.noc) formData.append('document_noc', pendingListingData.noc);

        await createListing(formData);

        setPendingListingData(null);
        toast({
          title: "Listing Submitted for Review!",
          description: "Your property has been sent to our staff for verification.",
        });
        
        setTimeout(() => setRateUsModalOpen(true), 500);
    } catch (error) {
        console.error("Failed to submit listing to Django:", error);
        toast({
            title: "Submission Failed",
            description: "There was an error connecting to the server. Please try again.",
            variant: "destructive"
        });
    }
  };
  
  const handleChat = (name: string) => {
    setChattingWith(name);
    setSelectedItem(null); 
    setChatModalOpen(true);
  };

  const handleBookInquiry = (listing: Listing, bed: Bed) => {
    setInquiryData({ listing, bed });
    setIsBookingModalOpen(true);
    setSelectedItem(null); 
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthActionRequired(null);
    saveToLocalStorage('setmystay_isLoggedIn', true);
    
    const intendedPage = sessionStorage.getItem('setmystay_intended_page');
    if (intendedPage === 'list') {
      setActivePage('list');
      sessionStorage.removeItem('setmystay_intended_page');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    saveToLocalStorage('setmystay_isLoggedIn', false);
    setUnlocks(defaultUserState.unlocks);
    setPurchaseHistory(defaultUserState.purchaseHistory);
    setLikedItemIds(new Set());
    setActivePage('home');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };
  
  const handleOpenConfirmationModal = (planName: string, amount: number, onConfirm: () => void) => {
    setPaymentDetails({ planName, amount, onConfirm });
    setIsPaymentConfirmationOpen(true);
  };

  const handleConfirmPayment = () => {
    if (paymentDetails) {
        paymentDetails.onConfirm();
    }
    setIsPaymentConfirmationOpen(false);
    setPaymentDetails(null);
  };

  const handleCouponWin = (coupon: Coupon) => {
    toast({
        title: "🎉 You Won a Coupon! 🎉",
        description: `Code: ${coupon.code} (${coupon.discountPercentage}% off). It has been copied to your clipboard!`,
    });
    navigator.clipboard.writeText(coupon.code);
  };

  // 👇 FIXED: Directly activates plan without popping up the confirmation modal a second time!
  const handlePlanSelect = (plan: { plan: UnlockPlan, title: string, price: number }) => {
    setUnlockModalOpen(false);
    setIsPaymentConfirmationOpen(false);
    handleUnlockPurchase(plan.plan, plan.title, plan.price);
  };

  const handleNavigationWithAuth = (page: Page) => {
      if (page === 'list') {
          window.location.href = '/list-property'; 
          return;
      }
      handleNavigate(page);
  };
  
  const handleGameClick = () => {
    if (!isLoggedIn) {
      setAuthActionRequired('play the game');
    } else {
      setIsSlotMachineModalOpen(true);
    }
  };

  if (isLoading || !isClient) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <LoadingSpinner className="w-16 h-16 text-primary" />
        <p className="mt-4 text-lg font-semibold text-foreground">Loading SetMyStay...</p>
      </div>
    );
  }
  
  const getListingsForPage = () => {
    switch (activePage) {
        case 'pg':
            return allListings.filter(l => l.propertyType === 'PG');
        case 'rentals':
            return allListings.filter(l => l.propertyType === 'Rental');
        case 'roommates':
            return allRoommates;
        case 'my-properties':
            return myProperties;
        case 'liked-properties':
            return likedItems;
        default:
            return [];
    }
  };
  
  const getPageType = (): ListingType => {
      if (['pg', 'rentals'].includes(activePage)) return activePage as ListingType;
      if (activePage === 'roommates') return 'roommate';
      if (activePage === 'my-properties' || activePage === 'liked-properties') return 'rentals'; 
      return 'rentals';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <Header 
        activePage={activePage} 
        setActivePage={handleNavigationWithAuth} 
        onSignInClick={() => setAuthModalOpen(true)}
        onSubscriptionClick={() => {
          setItemToUnlock(null); 
          setUnlockModalOpen(true);
        }}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onHistoryClick={() => setHistoryModalOpen(true)}
      />
      
      <main key={activePage} className="flex-grow animate-page-in">
        {activePage === 'home' && (
          <HomeSection 
            featuredProperties={featuredProperties} 
            featuredRoommates={featuredRoommates.filter(r => r.hasProperty)} 
            onViewDetails={handleViewDetails}
            onNavigate={handleNavigationWithAuth}
            likedItemIds={likedItemIds}
            onToggleLike={handleToggleLike}
            unlockedIds={unlocks.unlockedIds}
          />
        )}
        {(['pg', 'rentals', 'roommates', 'my-properties', 'liked-properties'].includes(activePage)) && (
            <ListingsSection
              key={activePage} 
              type={getPageType()}
              listings={getListingsForPage()}
              onViewDetails={handleViewDetails}
              initialSearchFilters={null}
              likedItemIds={likedItemIds}
              onToggleLike={handleToggleLike}
              unlockedIds={unlocks.unlockedIds}
              pageTitle={
                activePage === 'my-properties' ? 'My Properties' :
                activePage === 'liked-properties' ? 'My Liked Properties' :
                undefined
              }
            />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
      <FloatingCta onGameClick={handleGameClick} />
      <ContactFab />
      
      {/* Modals */}
      <PropertyDetails 
        listing={selectedItem?.type === 'listing' ? selectedItem.data as Listing : null}
        onClose={() => setSelectedItem(null)}
        isUnlocked={isLoggedIn && selectedItem?.data ? unlocks.unlockedIds.has(selectedItem.data.id) : false}
        onUnlock={handleUnlockClick}
        onChat={() => handleChat(selectedItem?.data?.ownerName || 'Owner')}
        onBookInquiry={handleBookInquiry}
      />
      <RoommateDetails
        profile={selectedItem?.type === 'roommate' ? selectedItem.data as RoommateProfile : null}
        onClose={() => setSelectedItem(null)}
        isUnlocked={isLoggedIn && selectedItem?.data ? unlocks.unlockedIds.has(selectedItem.data.id) : false}
        onUnlock={handleUnlockClick}
        onChat={() => handleChat(selectedItem?.data?.ownerName || 'Roommate')}
      />
      <AlertDialog open={isUnlockConfirmationOpen} onOpenChange={setUnlockConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unlock</AlertDialogTitle>
            <AlertDialogDescription>
              This will use one of your unlock credits. This action cannot be undone.
              You have {unlocks.count} unlocks remaining.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnlock}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <UnlockDetailsModal 
        isOpen={isUnlockModalOpen}
        onClose={() => {
            setUnlockModalOpen(false);
            if (itemToUnlock) {
                setSelectedItem(itemToUnlock);
                setItemToUnlock(null);
            }
        }}
        onPlanSelect={handlePlanSelect}
        onNavigateToListProperty={() => {
          setUnlockModalOpen(false);
          handleNavigationWithAuth('list');
        }}
        pricing={pricing}
      />
      <ListPropertyPaymentModal
        isOpen={isListPaymentModalOpen}
        onClose={() => setListPaymentModalOpen(false)}
        propertyId={pendingListingData?.id || ''}
        onProceedToPayment={handleListProperty}
        pricing={pricing}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
            setAuthModalOpen(false);
            setAuthActionRequired(null);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setChatModalOpen(false)}
        contactName={chattingWith}
      />
      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        purchases={purchaseHistory}
      />
      <RateUsModal 
        isOpen={isRateUsModalOpen}
        onClose={handleRateUsClose}
      />
      <BookingInquiryModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        listing={inquiryData?.listing || null}
        bed={inquiryData?.bed || null}
      />
      <AdvertisementModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        title={adToShow?.title || ''}
        description={adToShow?.description || ''}
        imageUrl={adToShow?.imageUrl || ''}
      />
      <PaymentConfirmationModal
        isOpen={isPaymentConfirmationOpen}
        onClose={() => setIsPaymentConfirmationOpen(false)}
        onConfirm={handleConfirmPayment}
        planName={paymentDetails?.planName || ''}
        amount={paymentDetails?.amount || 0}
        availableCoupons={activeCoupons}
      />
      <SlotMachineModal
        isOpen={isSlotMachineModalOpen}
        onClose={() => setIsSlotMachineModalOpen(false)}
        prizes={activeCoupons.filter(c => c.isActive)}
        onWin={handleCouponWin}
      />
    </div>
  );
}