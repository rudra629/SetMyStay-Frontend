import axios from 'axios';
import { Listing, RoommateProfile } from './types'; 

const API_URL = 'http://127.0.0.1:8000/api';

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
  // 👇 FIX: Properly map all three property types!
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
    brokerStatus: data.is_broker ? 'With Broker' : 'Without Broker', // Fixed this too!
    lastAvailabilityCheck: data.created_at,
    submittedAt: data.created_at,
    status: data.status === 'APPROVED' ? 'approved' : 'pending',
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
    status: 'approved',
    submittedAt: '2025-01-01',
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

// 👇 ADDED: Fetch specifically Roommate properties using the query param trick
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
  // We use the interceptor for auth, but we need to override the content type for files
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

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 (Unauthorized), it means our token is bad.
    if (error.response && error.response.status === 401) {
      // 1. Clear the bad token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('setmystay_isLoggedIn');
      }
    }
    return Promise.reject(error);
  }
);

export default api;