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
    console.log("FORM DATA PAYLOAD:", data);
    setFormData(data);
    setIsPaymentModalOpen(true);
  };

  // 2. When Payment is "Successful", Send Data to Django
  const handlePaymentSuccess = async (plan: { title: string; price: number }) => {
    try {
      setIsPaymentModalOpen(false);
      
      const payload = new FormData();
      
      // --- BASIC FIELDS ---
      payload.append('title', formData.title);
      payload.append('description', formData.description || 'No description provided');
      payload.append('property_type', formData.property_type); 
      payload.append('rent', formData.rent.toString());
      payload.append('deposit', formData.rent.toString());
      
      // --- LOCATION ---
      payload.append('city', formData.city);
      payload.append('area', formData.locality || formData.area);
      payload.append('address', formData.address);
      
      // --- SPECS ---
      payload.append('sq_ft', formData.area ? formData.area.toString() : '500'); 
      payload.append('bhk', '1BHK');       
      payload.append('furnishing', 'Semi'); 
      payload.append('status', 'PENDING');

      payload.append('owner_name', formData.owner_name);
      payload.append('phone_primary', formData.phone_primary);
      
      if (formData.phone_secondary) {
        payload.append('phone_secondary', formData.phone_secondary);
      }

      // 👇 THE MISSING PIECE: ADDING AMENITIES TO THE PAYLOAD 👇
      if (formData.amenities) {
        const amenitiesString = Array.isArray(formData.amenities) 
            ? formData.amenities.join(',') 
            : formData.amenities;
        payload.append('amenities_list', amenitiesString);
      }

      // --- CONDITIONAL FIELDS BASED ON TYPE ---
      if (formData.property_type === 'ROOMMATE') {
          payload.append('gender_preference', formData.gender_preference);
          payload.append('sharing_status', formData.sharing_status);
      } else if (formData.property_type === 'RENTAL') {
          payload.append('is_broker', formData.is_broker ? 'True' : 'False');
      } else {
          payload.append('occupancy_type', 'Single'); 
          payload.append('gender_preference', 'Any'); 
      }

      // --- IMAGES ---
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file: File) => {
          payload.append('uploaded_images', file);
        });
      }

      // --- DOCUMENTS ---
      const aadharFile = formData.aadhaar_card || formData.aadhaarCard;
      const electricFile = formData.electricity_bill || formData.electricityBill;
      const nocFile = formData.noc;

      if (aadharFile) {
          payload.append('document_aadhaar', Array.isArray(aadharFile) ? aadharFile[0] : aadharFile);
      }
      if (electricFile) {
          payload.append('document_electricity', Array.isArray(electricFile) ? electricFile[0] : electricFile);
      }
      if (nocFile) {
          payload.append('document_noc', Array.isArray(nocFile) ? nocFile[0] : nocFile);
      }
      
      console.log("Submitting Payload..."); 

      await createListing(payload);

      toast({
        title: "Success!",
        description: "Your property has been submitted for review.",
      });

      router.push('/'); 

    } catch (error: any) {
      console.error("Submission Error:", error);
      
      const serverMessage = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : "Please check that all fields are correct.";

      toast({
        title: "Submission Failed",
        description: `Server Error: ${serverMessage}`,
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