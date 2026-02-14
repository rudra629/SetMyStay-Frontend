"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListPropertySection } from '@/components/sections/list-property-section';
import { ListPropertyPaymentModal } from '@/components/modals/list-property-payment-modal';
import { createListing } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ListPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // 1. When Form is Valid, Open Payment Modal
  const handleFormSubmit = (data: any) => {
    setFormData(data);
    setIsPaymentModalOpen(true);
  };

  // 2. When Payment is "Successful", Send Data to Django
// Inside src/app/list-property/page.tsx

// ... imports ...

// REPLACE your handlePaymentSuccess function with this one:
const handlePaymentSuccess = async (plan: { title: string; price: number }) => {
    try {
      setIsPaymentModalOpen(false);
      
      const payload = new FormData();
      
      // --- BASIC FIELDS ---
      payload.append('title', formData.title);
      payload.append('description', formData.description || 'No description provided'); // 👈 Prevent empty strings
      payload.append('property_type', formData.propertyType === 'Rental' ? 'RENTAL' : 'PG');
      payload.append('rent', formData.rent.toString());
      payload.append('deposit', formData.rent.toString());
      
      // --- LOCATION ---
      payload.append('city', formData.city);
      payload.append('area', formData.locality);
      payload.append('address', formData.address);
      
      // --- SPECS (The most common cause of 400 errors) ---
      // We explicitly set defaults if they are missing
      payload.append('sq_ft', formData.area ? formData.area.toString() : '500'); 
      payload.append('bhk', '1BHK');       // Ensure this matches your Django Model choices!
      payload.append('furnishing', 'Semi'); // Ensure this matches your Django Model choices!
      payload.append('occupancy_type', 'Single'); // Required for PG
      payload.append('gender_preference', 'Any'); // Required for PG
      
      // --- STATUS ---
      payload.append('status', 'PENDING');

      // --- IMAGES ---
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file: File) => {
          payload.append('uploaded_images', file);
        });
      }

      console.log("Submitting Payload..."); // Debug log

      await createListing(payload);

      toast({
        title: "Success!",
        description: "Your property has been submitted for review.",
      });

      router.push('/'); 

    } catch (error: any) {
      console.error("Submission Error:", error);
      
      // 👇 THIS IS THE IMPORTANT PART
      // It extracts the specific message from Django (e.g., "BHK is invalid")
      const serverMessage = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : "Please check that all fields are correct.";

      toast({
        title: "Submission Failed",
        description: `Server Error: ${serverMessage}`, // Shows the real reason on screen!
        variant: "destructive",
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <ListPropertySection onSubmit={handleFormSubmit} />
      
      <ListPropertyPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onProceedToPayment={handlePaymentSuccess}
        pricing={null} 
      />
    </main>
  );
}