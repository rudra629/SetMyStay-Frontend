"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UploadCloud, X, ShieldCheck, Video, Plus, FileText, FileUp, Wifi, Car, Dumbbell, Utensils, Tv, Snowflake, Wind, Droplets, Zap, Shield, VenetianMask, User, Leaf, PawPrint, Sparkles, ArrowBigUpDash, Briefcase } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { AutocompleteInput } from '@/components/shared/autocomplete-input';
import { indianStates } from '@/lib/states';
import { allIndianCities, indianCitiesByState } from '@/lib/cities';
import { indianAreas } from '@/lib/areas';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';

const amenitiesList = [
  'Electricity Backup', '24x7 Water Supply', 'Lift/Elevator', 'Gated Security', 'Reserved Parking', 'Visitor Parking', 'Intercom Facility', 'Power Backup', 'Fire Safety', 'CCTV Surveillance',
  'Wi-Fi', 'Broadband Internet', 'Smart Home Features', 'DTH/Cable TV', 'Mobile Charging Points', 'LAN Port',
  'Gymnasium', 'Swimming Pool', 'Yoga Area', 'Jogging Track', 'Spa/Sauna', 'Health Club',
  'Club House', 'Party Hall', 'Community Hall', 'Amphitheatre', 'Library', 'Indoor Games (TT, Carrom)', 'Outdoor Games (Tennis, Basketball)', 'Lounge/Common Room',
  "Kids' Play Area", 'Daycare Center', 'Senior Citizen Sitting Area', 'Family Area',
  'Landscaped Garden', 'Balcony', 'Terrace Garden', 'Sit-out Area', 'Park View', 'Lake View', 'Open Green Space', 'Eco-friendly (Solar Panels, Rainwater Harvesting)',
  'Western Toilet', 'Indian Toilet', 'Attached Bathroom', 'Shared Bathroom', 'Geyser', 'Shower', 'Bathtub', 'Wash Basin', 'Towel Rack', 'Exhaust Fan', 'Toilet Paper Holder', 'Hot & Cold Water', 'Mirror',
  'Private Kitchen', 'Shared Kitchen', 'Modular Kitchen', 'Refrigerator', 'Microwave', 'Gas Connection', 'Induction', 'Chimney', 'Water Purifier (RO/UV)', 'Sink', 'Kitchen Utensils', 'Dining Table',
  'Single Bed', 'Double Bed', 'Mattress', 'Pillow', 'Blanket', 'Wardrobe', 'Study Table', 'Chair', 'Dressing Table', 'Fan', 'Lights', 'Curtains', 'AC', 'Cooler', 'TV', 'Shoe Rack', 'Side Table',
  'Washing Machine (Private/Common)', 'Laundry Service', 'Drying Area', 'Iron & Ironing Board', 'Dustbin', 'Broom/Mop', 'Bucket & Mug', 'Cleaning Tools',
  'Room Cleaning', 'Bathroom Cleaning', 'Linen Change', 'Daily/Weekly Cleaning',
  'In-house Mess', 'Tiffin Service', 'Veg/Non-Veg Available', 'Breakfast/Lunch/Dinner', 'Self Cooking Allowed', 'Common Dining Area',
  '24x7 Security Guard', 'CCTV Cameras', 'Biometric Access', 'Keycard Entry', 'Fire Alarm', 'Fire Exit', 'First Aid Kit', 'Emergency Alarm',
  'Lift', 'Reception Area', 'Front Desk', 'Terrace Access', 'Common Hall', 'Lounge Area', 'Generator Backup', 'Pantry', 'RO Water', 'EV Charging Point',
  'Two-Wheeler Parking', 'Car Parking', 'Valet Parking', 'EV Charging', 'Shuttle Service',
  'Near Metro Station', 'Near Bus Stop', 'Near Grocery Store', 'Near Mall', 'Near College', 'Near Office', 'Near Hospital', 'Near ATM', 'Peaceful Area',
  'Parking', 'Gym', 'Pool', 'Elevator', 'Security', 'Meals', 'Laundry', 'Housekeeping', 'Garden',
  'Non-Smoker', 'Vegetarian', 'Non-Vegetarian', 'Clean', 'Drinker', 'Pet-Friendly'
].filter((value, index, self) => self.indexOf(value) === index);

const amenityIcons: { [key: string]: React.ElementType } = {
  'AC': Snowflake, 'Wi-Fi': Wifi, 'Parking': Car, 'Gymnasium': Dumbbell, 'Lift/Elevator': ArrowBigUpDash, 'Security': Shield, 'Balcony': VenetianMask, 'Power Backup': Zap, 'In-house Mess': Utensils, 'Washing Machine (Private/Common)': Droplets, 'Housekeeping': Droplets, 'Garden': Wind, 'TV': Tv, 'Refrigerator': Snowflake, 'Attached Bathroom': User, 'Reserved Parking': Car, 'Lift': ArrowBigUpDash, 'Gated Security': Shield, 'Non-Smoker': User, 'Vegetarian': Leaf, 'Pet-Friendly': PawPrint, 'Clean': Sparkles
};

const topAmenitiesByPropertyType: { [key: string]: string[] } = {
  'RENTAL': ['AC', 'Wi-Fi', 'Parking', 'Gymnasium', 'Lift/Elevator', 'Security', 'Balcony', 'Power Backup'],
  'PG': ['AC', 'Wi-Fi', 'In-house Mess', 'Washing Machine (Private/Common)', 'Lift/Elevator', 'Security', 'Power Backup', 'Refrigerator'],
  'ROOMMATE': ['Non-Smoker', 'Vegetarian', 'Pet-Friendly', 'Lift/Elevator', 'Wi-Fi', 'AC', 'Attached Bathroom', 'Reserved Parking']
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

const fileSchema = z
  .any()
  .refine((files) => files?.length === 1, "File is required.")
  .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), ".jpg, .jpeg, .png and .pdf files are accepted.");

const formSchema = z.object({
  propertyType: z.enum(['RENTAL', 'PG', 'ROOMMATE']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  rent: z.coerce.number().min(1000, 'Rent must be at least 1000'),
  area: z.coerce.number().min(50, 'Area must be at least 50 sq ft'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  locality: z.string().min(1, 'Area / Locality is required'),
  sector: z.string().optional(),
  address: z.string().optional(),
  ownerName: z.string().min(2, 'Name is required'),
  phonePrimary: z.string().refine((val) => /^\d{10}$/.test(val), {
    message: "Primary phone number must be 10 digits.",
  }),
  phoneSecondary: z.string().refine((val) => val === "" || /^\d{10}$/.test(val), {
    message: "Secondary phone number must be 10 digits.",
  }).optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  brokerStatus: z.enum(['With Broker', 'Without Broker']).optional(),
  aadhaarCard: fileSchema,
  electricityBill: fileSchema.optional(),
  noc: z.any().optional(),
  videoFile: z.any().optional(),
  vendorNumber: z.string().optional(),
  gender: z.string().optional(),
  roommateStatus: z.enum(['hasProperty', 'needsProperty']).optional(),
}).superRefine((data, ctx) => {
    const isNeedsProperty = data.propertyType === 'ROOMMATE' && data.roommateStatus === 'needsProperty';

    if (!isNeedsProperty) {
        if (!data.address || data.address.length < 10) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Full address is required.',
                path: ['address'],
            });
        }
        if (!data.videoFile || data.videoFile.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Video tour is required.',
                path: ['videoFile'],
            });
        }
    }

    if (data.propertyType === 'RENTAL' && !data.brokerStatus) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Broker status is required for rentals.",
            path: ['brokerStatus'],
        });
    }
    if ((data.propertyType === 'RENTAL' || data.propertyType === 'PG')) {
        if (!data.electricityBill) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Electricity Bill is required for Rental and PG listings.',
                path: ['electricityBill'],
            });
        }
    }
    if (data.propertyType === 'ROOMMATE') {
        if (!data.gender) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Gender is required when looking for a roommate.',
                path: ['gender'],
            });
        }
        if (!data.roommateStatus) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please select what you are looking for.',
                path: ['roommateStatus'],
            });
        }
        if (data.roommateStatus === 'hasProperty' && !data.electricityBill) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Electricity Bill is required if you already have a property.',
                path: ['electricityBill'],
            });
        }
    }
});

type FormValues = z.infer<typeof formSchema>;

interface ListPropertySectionProps {
  onSubmit: (data: FormValues & { images: File[] }) => void;
}

const FileUploadField = ({ name, label, control, required = false, inputRef }: { name: "aadhaarCard" | "electricityBill" | "noc", label: string, control: any, required?: boolean, inputRef?: React.Ref<HTMLInputElement> }) => {
    const [fileName, setFileName] = useState<string | null>(null);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}{required && <span className="text-destructive">*</span>}</FormLabel>
                    <FormControl>
                        <div
                            className="border-2 border-dashed border-muted rounded-lg p-4 text-center cursor-pointer hover:border-primary"
                            onClick={() => (inputRef as React.RefObject<HTMLInputElement>)?.current?.click()}
                        >
                            <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                {fileName || `Click to upload ${label}`}
                            </p>
                            <Input
                                id={`upload-${name}`}
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onBlur={field.onBlur}
                                name={field.name}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        field.onChange(e.target.files);
                                        setFileName(file.name);
                                    }
                                }}
                                ref={inputRef}
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export function ListPropertySection({ onSubmit }: ListPropertySectionProps) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const { toast } = useToast();
  
  const electricityBillRef = useRef<HTMLInputElement>(null);
  const aadhaarRef = useRef<HTMLInputElement>(null);
  const nocRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyType: 'RENTAL',
      brokerStatus: 'Without Broker',
      rent: 15000,
      area: 1200,
      amenities: [],
      phonePrimary: '',
      phoneSecondary: '',
      vendorNumber: '',
      gender: undefined,
      state: '',
      city: '',
      locality: '',
      sector: '',
      roommateStatus: undefined,
      description: '',
    },
  });
  
  const propertyType = form.watch('propertyType');
  const roommateStatus = form.watch('roommateStatus');
  const stateValue = form.watch('state');
  const cityValue = form.watch('city');
  const selectedAmenities = form.watch('amenities') || [];
  const topAmenities = topAmenitiesByPropertyType[propertyType] || [];

  const citySuggestions = stateValue ? indianCitiesByState[stateValue] || [] : allIndianCities;
  const areaSuggestions = cityValue ? indianAreas[cityValue] || [] : [];

  useEffect(() => {
    form.setValue('city', '');
  }, [stateValue, form]);

  useEffect(() => {
    form.setValue('locality', '');
  }, [cityValue, form]);

  useEffect(() => {
    if (propertyType !== 'ROOMMATE') {
        form.setValue('roommateStatus', undefined);
    }
    if (propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty') {
        form.setValue('electricityBill', undefined);
        if (electricityBillRef.current) {
            electricityBillRef.current.value = "";
        }
    }
  }, [propertyType, roommateStatus, form]);

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    if (mediaFiles.length === 0) {
        toast({
            title: "Photos Required",
            description: data.propertyType === 'ROOMMATE' && data.roommateStatus === 'needsProperty' ? "Please upload at least one profile photo." : "Please upload at least one photo of your property.",
            variant: "destructive",
        });
        return;
    }
    
    const finalData: any = { 
        property_type: data.propertyType,
        title: data.title,
        rent: data.rent,
        area: data.area,
        state: data.state,
        city: data.city,
        locality: data.locality,
        sector: data.sector || '',
        address: data.address || '',
        owner_name: data.ownerName,
        phone_primary: data.phonePrimary,
        phone_secondary: data.phoneSecondary || '',
        description: data.description || '',
        vendor_number: data.vendorNumber || '',
        amenities: JSON.stringify(data.amenities || []), 
        is_broker: data.brokerStatus === 'With Broker',
        gender_preference: data.gender || '',
        sharing_status: data.roommateStatus === 'hasProperty' ? 'Living in' : (data.roommateStatus === 'needsProperty' ? 'Moving soon' : ''),
        images: mediaFiles,
        video_file: data.videoFile?.[0] || null,
        aadhaar_card: data.aadhaarCard?.[0],
        electricity_bill: data.electricityBill?.[0] || null,
        noc: data.noc?.[0] || null,
    };

    onSubmit(finalData);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const newFiles = Array.from(event.target.files);
        const totalFiles = mediaFiles.length + newFiles.length;
        if (totalFiles > 8) {
            toast({
                title: 'Upload Limit Exceeded',
                description: 'You can upload a maximum of 8 photos.',
                variant: 'destructive',
            });
            const remainingSlots = 8 - mediaFiles.length;
            if (remainingSlots > 0) {
                 setMediaFiles(prev => [...prev, ...newFiles.slice(0, remainingSlots)]);
            }
        } else {
             setMediaFiles(prev => [...prev, ...newFiles]);
        }
    }
  };

  const handleAddCustomAmenity = () => {
    if (customAmenity && amenitiesList.includes(customAmenity) && !selectedAmenities.includes(customAmenity)) {
        form.setValue('amenities', [...selectedAmenities, customAmenity]);
        setCustomAmenity('');
    }
  };

  const handleRemoveAmenity = (amenityToRemove: string) => {
    form.setValue('amenities', selectedAmenities.filter(a => a !== amenityToRemove));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">List Your Property</h1>
            <p className="mt-4 text-lg text-muted-foreground">Reach thousands of potential tenants and roommates by listing your space on SetMyStay.</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
                <CardDescription>Start with the basics about your property.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="propertyType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="RENTAL">Rental (BHK/House)</SelectItem>
                        <SelectItem value="PG">PG / Co-living</SelectItem>
                        <SelectItem value="ROOMMATE">Looking for Roommate</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}/>

                {propertyType === 'ROOMMATE' && (
                    <FormField control={form.control} name="roommateStatus" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>What are you looking for?</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col sm:flex-row gap-4"
                                >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="hasProperty" /></FormControl>
                                        <FormLabel className="font-normal">Roommate (I have a place)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="needsProperty" /></FormControl>
                                        <FormLabel className="font-normal">A property (I need a place)</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                )}

                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty' ? 'Profile Title / Tagline' : 'Property Title / Your Tagline'}</FormLabel>
                    <FormControl><Input placeholder={propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty' ? "e.g., Working professional looking for clean flatmates" : "e.g., Spacious 2BHK Apartment"} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="rent" render={({ field }) => (
                  <FormItem><FormLabel>{propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty' ? 'Target Budget (₹)' : 'Monthly Rent (₹)'}</FormLabel><FormControl><Input type="number" placeholder="15000" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem><FormLabel>Area (sq ft)</FormLabel><FormControl><Input type="number" placeholder="1200" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                {propertyType === 'ROOMMATE' && (
                    <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                )}
                
                {propertyType === 'RENTAL' && (
                  <FormField control={form.control} name="brokerStatus" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Are you a broker or owner?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Without Broker" /></FormControl>
                            <FormLabel className="font-normal">Owner</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="With Broker" /></FormControl>
                            <FormLabel className="font-normal">Broker</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}

                <div className="md:col-span-2">
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty' ? 'About You' : 'Property Description'}</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder={propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty' 
                                        ? "Tell potential flatmates a bit about yourself, your habits, food choices, routine..." 
                                        : "Describe the property, nearby landmarks, security, and key features..."} 
                                    className="min-h-[100px]"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                    <CardDescription>Select all preferences or facilities that apply.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="amenities"
                        render={() => (
                            <FormItem>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
                                  {topAmenities.map((amenity) => {
                                      const Icon = amenityIcons[amenity] || Shield;
                                      return (
                                        <FormField
                                            key={amenity}
                                            control={form.control}
                                            name="amenities"
                                            render={({ field }) => (
                                                <FormItem key={amenity} className="flex-1">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(amenity)}
                                                            onCheckedChange={(checked) => {
                                                                const updatedAmenities = checked
                                                                    ? [...(field.value || []), amenity]
                                                                    : field.value?.filter((value) => value !== amenity);
                                                                field.onChange(updatedAmenities);
                                                            }}
                                                            className="sr-only"
                                                            id={`amenity-${amenity}`}
                                                        />
                                                    </FormControl>
                                                    <FormLabel 
                                                        htmlFor={`amenity-${amenity}`}
                                                        className="flex flex-col items-center justify-center gap-2 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
                                                        data-state={field.value?.includes(amenity) ? 'checked' : 'unchecked'}
                                                    >
                                                      <Icon className="w-6 h-6" />
                                                      <span className="text-sm font-medium text-center">{amenity}</span>
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                      );
                                  })}
                                </div>
                                <div className="mt-6">
                                  <FormLabel>Search for more options</FormLabel>
                                  <div className="flex gap-2 mt-2">
                                      <AutocompleteInput 
                                        placeholder="e.g., Piped Gas, Non-Smoker"
                                        value={customAmenity}
                                        onChange={setCustomAmenity}
                                        suggestions={amenitiesList.filter(a => !selectedAmenities.includes(a))}
                                      />
                                      <Button type="button" onClick={handleAddCustomAmenity}>
                                          <Plus className="w-4 h-4 mr-2" /> Add
                                      </Button>
                                  </div>
                                </div>

                                {selectedAmenities.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="text-sm font-medium mb-2">Selected Selections:</h4>
                                        <ScrollArea className="h-40">
                                            <div className="flex flex-wrap gap-2">
                                                {selectedAmenities.map((amenity) => (
                                                    <Badge key={amenity} variant="secondary" className="pl-2">
                                                        {amenity}
                                                        <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="ml-2 p-0.5 rounded-full hover:bg-destructive/20 text-destructive">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty' ? "Profile Photos" : "Photo & Video Upload"}</CardTitle>
                <CardDescription>
                    {propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty' 
                        ? "Add up to 8 photos of yourself to display on your profile canvas." 
                        : "Add up to 8 photos and a mandatory video tour."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="mb-6">
                    <FormLabel>Photos</FormLabel>
                    <div 
                        className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary" 
                        onClick={() => mediaFiles.length < 8 && document.getElementById('media-upload')?.click()}
                    >
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground"/>
                      <p className="mt-4 text-sm text-muted-foreground">Drag & drop or click to upload photos</p>
                      <p className="text-xs text-muted-foreground mt-1">{mediaFiles.length}/8 uploads completed</p>
                      <Input 
                        id="media-upload" 
                        type="file" multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={mediaFiles.length >= 8}
                      />
                    </div>
                    {mediaFiles.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-4">
                        {mediaFiles.map((file, i) => (
                          <div key={i} className="relative group">
                            <Image src={URL.createObjectURL(file)} alt={file.name} width={100} height={100} className="w-full h-24 object-cover rounded-md"/>
                            <button type="button" onClick={() => setMediaFiles(mediaFiles.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3"/>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Video Tour Row - Completely hidden when looking for a property */}
                {!(propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty') && (
                    <div>
                        <FormField
                            control={form.control}
                            name="videoFile"
                            render={({ field: { onChange, onBlur, name, ref } }) => (
                                <FormItem>
                                    <FormLabel>Video Tour (Required)</FormLabel>
                                    <FormControl>
                                        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary" onClick={() => document.getElementById('video-upload')?.click()}>
                                            <Video className="mx-auto h-12 w-12 text-muted-foreground"/>
                                            <p className="mt-4 text-sm text-muted-foreground">
                                                {form.getValues('videoFile')?.[0]?.name || 'Click to upload video file'}
                                            </p>
                                            <Input
                                                id="video-upload"
                                                type="file"
                                                accept="video/*"
                                                className="hidden"
                                                onBlur={onBlur}
                                                name={name}
                                                onChange={(e) => onChange(e.target.files)}
                                                ref={ref}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>
                    {propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty' 
                        ? "Select the details of the targeted areas where you are hunting for a room." 
                        : "Specify the exact address markers where the space resides."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                            <AutocompleteInput 
                                placeholder="e.g., Maharashtra"
                                value={field.value}
                                onChange={field.onChange}
                                suggestions={indianStates}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}/>
                 <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                            <AutocompleteInput 
                                placeholder="e.g., Navi Mumbai"
                                value={field.value}
                                onChange={field.onChange}
                                suggestions={citySuggestions}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="locality" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area / Locality</FormLabel>
                        <FormControl>
                           <AutocompleteInput 
                                placeholder="e.g., Kharghar"
                                value={field.value}
                                onChange={field.onChange}
                                suggestions={areaSuggestions}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="sector" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <FormControl>
                           <Input 
                                placeholder="e.g., Sector 15"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}/>
                  
                  {/* Full Address Block - Hidden when checking for property profiles */}
                  {!(propertyType === 'ROOMMATE' && roommateStatus === 'needsProperty') && (
                      <div className="md:col-span-2">
                        <FormField control={form.control} name="address" render={({ field }) => (
                          <FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Enter complete flat layout registry details..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                      </div>
                  )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="ownerName" render={({ field }) => (
                  <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="phonePrimary" render={({ field }) => (
                  <FormItem><FormLabel>Primary Phone Number (Required)</FormLabel><FormControl><Input type="tel" placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="phoneSecondary" render={({ field }) => (
                  <FormItem><FormLabel>Secondary Phone Number (Optional)</FormLabel><FormControl><Input type="tel" placeholder="9876543211" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
                <CardDescription>This is optional. If you have a vendor number from our admin, please enter it here.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="vendorNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., Admin1234" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
                <CardDescription>Upload these documents for verification. This will only be visible to our admin team.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                 <FileUploadField name="aadhaarCard" label="Aadhaar Card" control={form.control} required inputRef={aadhaarRef} />
                 
                 {(propertyType === 'RENTAL' || propertyType === 'PG' || (propertyType === 'ROOMMATE' && roommateStatus === 'hasProperty')) && (
                    <FileUploadField name="electricityBill" label="Electricity Bill" control={form.control} required inputRef={electricityBillRef}/>
                 )}
                 
                 {propertyType !== 'ROOMMATE' && (
                    <div className="md:col-span-2">
                       <FileUploadField name="noc" label="NOC (Optional)" control={form.control} inputRef={nocRef} />
                         <Alert className="mt-2">
                           <ShieldCheck className="h-4 w-4" />
                           <AlertTitle>Boost Your Listing!</AlertTitle>
                           <AlertDescription>
                             Uploading a No Objection Certificate (NOC) increases validation speed and property visibility rankings.
                           </AlertDescription>
                         </Alert>
                    </div>
                 )}
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full">
                Proceed to Payment & List
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}