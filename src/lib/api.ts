import axios from 'axios';
import { Listing, RoommateProfile } from './types'; 

// Changed to localhost to match your Google OAuth fix!
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 🔐 AUTHENTICATION INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- ADAPTERS ---
const adaptPropertyToListing = (data: any): Listing => {
  let mappedType = 'PG';
  if (data.property_type === 'RENTAL') mappedType = 'Rental';
  if (data.property_type === 'ROOMMATE') mappedType = 'Roommate';

  return {
    id: data.id.toString(),
    propertyType: mappedType as any, 
    title: data.title,
    rent: data.rent,
    area: data.sq_ft || 0,
    city: data.city,
    locality: data.area,
    state: 'Maharashtra',
    completeAddress: data.address,
    partialAddress: data.area,
    ownerName: data.owner_name || 'Owner',
    contactPhonePrimary: 'Hidden',
    description: data.description,
    furnishedStatus: data.furnishing || 'Unfurnished',
    amenities: data.amenities ? data.amenities.map((a: any) => a.name) : [],
    size: data.bhk || '1 BHK',
    images: data.images ? data.images.map((img: any) => img.image_url) : [],
    views: 0,
    ownerId: data.owner || '1',
    brokerStatus: data.is_broker ? 'With Broker' : 'Without Broker', 

    aadhaarCardUrl: data.document_aadhaar || undefined,
    electricityBillUrl: data.document_electricity || undefined,
    nocUrl: data.document_noc || undefined,
    
    lastAvailabilityCheck: data.created_at,
    submittedAt: data.created_at,
    status: data.status === 'APPROVED' ? 'approved' : data.status === 'REJECTED' ? 'rejected' : 'pending',
  };
};

const adaptRoommateToProfile = (data: any): RoommateProfile => {
  return {
    id: data.id.toString(),
    propertyType: 'Roommate',
    ownerName: data.user_name || 'User',
    age: 25,
    rent: data.budget,
    city: data.location_preference,
    locality: data.location_preference,
    state: 'Maharashtra',
    completeAddress: data.location_preference,
    partialAddress: data.location_preference,
    contactPhonePrimary: 'Hidden',
    description: `Looking for roommate in ${data.location_preference}`,
    preferences: [
        data.is_smoker ? 'Smoker' : 'Non-Smoker', 
        data.has_pets ? 'Has Pets' : 'No Pets'
    ],
    gender: 'Any',
    images: ['https://placehold.co/400x400'],
    views: 0,
    ownerId: data.user?.toString() || '1',
    hasProperty: false,
    submittedAt: data.created_at || '2025-01-01', // Grab real date if available
    
    // 👇 FIX: Map the actual status from Django instead of hardcoding it
    status: data.status === 'APPROVED' ? 'approved' : data.status === 'REJECTED' ? 'rejected' : 'pending',
    
    
  };
};

// --- API CALLS ---

export const getProperties = async (): Promise<Listing[]> => {
  try {
    const response = await api.get('/properties/');
    const rawData = response.data.results ? response.data.results : response.data;
    return rawData.map(adaptPropertyToListing);
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return [];
  }
};

export const getAdminProperties = async (): Promise<Listing[]> => {
  try {
    // Notice the ?admin=true tag!
    const response = await api.get('/properties/?admin=true');
    const rawData = response.data.results ? response.data.results : response.data;
    return rawData.map(adaptPropertyToListing);
  } catch (error) {
    console.error("Failed to fetch admin properties:", error);
    return [];
  }
};

export const getRoommateProperties = async (): Promise<Listing[]> => {
  try {
    const response = await api.get('/properties/?property_type=ROOMMATE');
    const rawData = response.data.results ? response.data.results : response.data;
    return rawData.map(adaptPropertyToListing);
  } catch (error) {
    console.error("Failed to fetch roommate properties:", error);
    return [];
  }
};

export const getRoommates = async (): Promise<RoommateProfile[]> => {
  try {
    const response = await api.get('/roommates/');
    const rawData = response.data.results ? response.data.results : response.data;
    return rawData.map(adaptRoommateToProfile);
  } catch (error) {
    console.error("Failed to fetch roommates:", error);
    return [];
  }
};

export const createListing = async (formData: FormData) => {
  const response = await api.post('/properties/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const loginUser = async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
};

export const toggleFavoriteProperty = async (propertyId: string) => {
  try {
    const response = await api.post(`/properties/${propertyId}/toggle_favorite/`);
    return response.data;
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    throw error;
  }
};

export const getMyProperties = async (): Promise<Listing[]> => {
  try {
    const response = await api.get('/my-properties/'); 
    const rawData = response.data.results ? response.data.results : response.data;
    return rawData.map(adaptPropertyToListing);
  } catch (error) {
    console.error("Failed to fetch my properties:", error);
    return [];
  }
};

// --- STAFF PROPERTY & ROOMMATE MANAGEMENT ---
export const updatePropertyStatus = async (id: string, newStatus: string) => {
  try {
    const response = await api.post(`/properties/${id}/update_status/?admin=true`, { status: newStatus.toUpperCase() });
    return response.data;
  } catch (error) {
    console.error("Failed to update property status:", error);
    throw error;
  }
};

export const deleteProperty = async (id: string) => {
  try {
    const response = await api.delete(`/properties/${id}/?admin=true`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete property:", error);
    throw error;
  }
};

// 👇 ADDED MISSING ROOMMATE FUNCTIONS FOR STAFF 👇
export const updateRoommateStatus = async (id: string, newStatus: string) => {
  try {
    const response = await api.patch(`/roommates/${id}/`, { status: newStatus.toUpperCase() });
    return response.data;
  } catch (error) {
    console.error("Failed to update roommate status:", error);
    throw error;
  }
};

export const deleteRoommate = async (id: string) => {
  try {
    const response = await api.delete(`/roommates/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete roommate:", error);
    throw error;
  }
};

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('setmystay_isLoggedIn');
      }
    }
    return Promise.reject(error);
  }
);

// --- COUPON API ---
export const getCoupons = async () => {
  const res = await api.get('/coupons/');
  const raw = res.data.results ? res.data.results : res.data;
  return raw.map((c: any) => ({ ...c, discountPercentage: c.discount_percentage, isActive: c.is_active }));
};
export const createCoupon = async (data: any) => await api.post('/coupons/', { code: data.code, discount_percentage: data.discountPercentage, is_active: data.isActive });
export const updateCoupon = async (id: string, data: any) => await api.patch(`/coupons/${id}/`, { code: data.code, discount_percentage: data.discountPercentage, is_active: data.isActive });
export const deleteCoupon = async (id: string) => await api.delete(`/coupons/${id}/`);

// --- ADVERTISEMENT API ---
export const getAdvertisements = async () => {
  const res = await api.get('/advertisements/');
  const raw = res.data.results ? res.data.results : res.data;
  return raw.map((a: any) => ({ ...a, isActive: a.is_active }));
};
export const createAdvertisement = async (formData: FormData) => await api.post('/advertisements/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateAdvertisement = async (id: string, formData: FormData) => await api.patch(`/advertisements/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteAdvertisement = async (id: string) => await api.delete(`/advertisements/${id}/`);

// --- STAFF API ---
export const getStaff = async () => {
  const res = await api.get('/staff/');
  const raw = res.data.results ? res.data.results : res.data;
  return raw.map((s: any) => ({
    id: s.id.toString(),
    name: s.first_name || s.username, // Fallback to username if name is empty
    userId: s.username,
  }));
};
export const createStaff = async (data: any) => {
    return await api.post('/staff/', { first_name: data.name, username: data.userId, password: data.password });
};
export const updateStaff = async (id: string, data: any) => {
    return await api.patch(`/staff/${id}/`, { first_name: data.name, username: data.userId, password: data.password });
};
export const deleteStaff = async (id: string) => {
    return await api.delete(`/staff/${id}/`);
};

export default api;