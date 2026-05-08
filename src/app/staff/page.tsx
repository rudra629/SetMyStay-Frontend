'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, LogOut, CheckCircle, Trash2, XCircle, FileText, ChevronLeft, ChevronRight, Search, Phone, MapPin, User as UserIcon, Briefcase, FileCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/icons';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Listing, RoommateProfile, AnyListing } from '@/lib/types';

// 👇 FIX: Import the live Django API calls!
import { getAdminProperties, updatePropertyStatus, updateRoommateStatus, deleteProperty, deleteRoommate } from '@/lib/api';

export default function StaffDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [properties, setProperties] = useState<Listing[]>([]);
    const [roommates, setRoommates] = useState<RoommateProfile[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<AnyListing | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [searchTerms, setSearchTerms] = useState({
        pending: '',
        approved: '',
        rejected: ''
    });

    // Fetch the live listings directly from Django
    const fetchListings = async () => {
        try {
            const allData = await getAdminProperties();
            
            const realProperties = allData.filter((p: any) => p.propertyType !== 'Roommate');
            const rawRoommates = allData.filter((p: any) => p.propertyType === 'Roommate');

            const realRoommates: RoommateProfile[] = rawRoommates.map((listing: any) => ({
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

            setProperties(realProperties);
            setRoommates(realRoommates);
        } catch (error) {
            console.error("Failed to load listings", error);
            toast({ title: 'Error', description: 'Could not fetch live listings from database.', variant: 'destructive' });
        }
    };

    useEffect(() => {
        const authStatus = localStorage.getItem('staff_authenticated');
        if (authStatus !== 'true') {
            router.replace('/staff/login');
        } else {
            setIsAuthenticated(true);
            // Wait for DB data to load before clearing the loading spinner
            fetchListings().finally(() => setIsLoading(false));
        }
    }, [router]);
    
    const handleLogout = () => {
        localStorage.removeItem('staff_authenticated');
        localStorage.removeItem('access_token'); // Clear the Django JWT
        router.replace('/staff/login');
    };
    
    const handleSearchChange = (status: 'pending' | 'approved' | 'rejected', value: string) => {
        setSearchTerms(prev => ({ ...prev, [status]: value }));
    };

    const getListingsByStatus = (status: 'pending' | 'approved' | 'rejected'): AnyListing[] => {
        const allSystemItems: AnyListing[] = [...properties, ...roommates];
        return allSystemItems.filter(item => item.status === status);
    };
    
    const filterAndSearchListings = (status: 'pending' | 'approved' | 'rejected') => {
        const listings = getListingsByStatus(status);
        const searchTerm = searchTerms[status].toLowerCase();
        
        if (!searchTerm) return listings;
        
        return listings.filter(item => 
            ('title' in item ? item.title : item.ownerName).toLowerCase().includes(searchTerm)
        );
    };

    const handleViewDetails = (item: AnyListing) => {
        setCurrentItem(item);
        setCurrentMediaIndex(0);
        setDetailsModalOpen(true);
    };
    
    const handleUpdateStatus = async (id: string, type: 'PG' | 'Rental' | 'Roommate', status: 'approved' | 'rejected') => {
        try {
            // Push update to Django
            if (type === 'Roommate') {
                await updateRoommateStatus(id, status);
            } else {
                await updatePropertyStatus(id, status);
            }
            
            toast({ title: "Status Updated", description: `Listing has been marked as ${status}.` });
            setDetailsModalOpen(false);
            
            // Instantly sync the UI with the fresh Database state
            fetchListings(); 
        } catch (error) {
            console.error("Update error:", error);
            toast({ title: "Update Failed", description: "Could not sync status with database.", variant: "destructive" });
        }
    };

    const handleDeleteItem = async (id: string, type: 'PG' | 'Rental' | 'Roommate') => {
        try {
            // Push delete command to Django
            if (type === 'Roommate') {
                await deleteRoommate(id);
            } else {
                await deleteProperty(id);
            }
            
            toast({ title: "Item Deleted", description: `Listing permanently removed.`, variant: 'destructive' });
            setDetailsModalOpen(false);
            
            // Instantly sync UI with the fresh Database state
            fetchListings(); 
        } catch (error) {
            console.error("Delete error:", error);
            toast({ title: "Delete Failed", description: "Could not delete from database.", variant: "destructive" });
        }
    };

    const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' | undefined }) => {
        if (!status) return null;
        const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold capitalize";
        const statusClasses: { [key: string]: string } = {
            pending: "bg-yellow-200 text-yellow-800",
            approved: "bg-green-200 text-green-800",
            rejected: "bg-red-200 text-red-800",
        };
        return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
    };
    
    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <LoadingSpinner className="w-12 h-12 text-primary" />
            </div>
        );
    }
    
    const renderListingsTable = (status: 'pending' | 'approved' | 'rejected') => {
        const listings = filterAndSearchListings(status);
        return (
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl capitalize">{status} Listings</CardTitle>
                            <CardDescription>Search and manage all {status} properties and roommate profiles.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by title or name..." 
                                value={searchTerms[status]}
                                onChange={(e) => handleSearchChange(status, e.target.value)}
                                className="pl-10 w-full sm:w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {listings.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title/Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listings.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{'title' in p ? p.title : p.ownerName}</TableCell>
                                        <TableCell className="capitalize">{p.propertyType}</TableCell>
                                        <TableCell>{p.submittedAt ? format(new Date(p.submittedAt), 'dd MMM, yyyy') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(p)}>View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No {status} listings found.</p>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 sm:py-2">
                     <h1 className="text-2xl font-bold text-slate-800">StayFinder Staff Panel</h1>
                     <div className="flex items-center gap-2 flex-wrap">
                        <Button asChild>
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" />
                                Go to Main Site
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                     </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <Tabs defaultValue="pending">
                    <div className="overflow-x-auto">
                        <TabsList className="mb-8 whitespace-nowrap">
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="pending">
                        {renderListingsTable('pending')}
                    </TabsContent>
                    <TabsContent value="approved">
                        {renderListingsTable('approved')}
                    </TabsContent>
                    <TabsContent value="rejected">
                        {renderListingsTable('rejected')}
                    </TabsContent>
                </Tabs>
            </main>

            {/* Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{currentItem && ('title' in currentItem ? currentItem.title : currentItem?.ownerName)}</DialogTitle>
                    </DialogHeader>
                    {currentItem && (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                             {Array.isArray(currentItem.images) && currentItem.images.length > 0 && (
                                <div className="relative w-full h-64 bg-slate-200 rounded-lg overflow-hidden">
                                     <Image 
                                        src={currentItem.images[currentMediaIndex]} 
                                        alt="Listing Media" 
                                        fill
                                        sizes="(max-width: 768px) 100vw, 800px"
                                        style={{ objectFit: 'contain' }}
                                        className="p-2"
                                     />
                                     {currentItem.images.length > 1 && (
                                         <>
                                            <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" onClick={() => setCurrentMediaIndex(i => Math.max(0, i-1))} disabled={currentMediaIndex === 0}><ChevronLeft /></Button>
                                            <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" onClick={() => setCurrentMediaIndex(i => Math.min(currentItem.images.length - 1, i+1))} disabled={currentMediaIndex === currentItem.images.length - 1}><ChevronRight /></Button>
                                         </>
                                     )}
                                </div>
                            )}

                            {('aadhaarCardUrl' in currentItem || 'electricityBillUrl' in currentItem || 'nocUrl' in currentItem) && (
                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                        <FileCheck className="w-5 h-5 text-blue-700" />
                                        Verification Documents
                                    </h4>
                                    <div className="flex flex-wrap gap-4">
                                        {'aadhaarCardUrl' in currentItem && currentItem.aadhaarCardUrl && (
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-8 h-8 text-blue-600"/>
                                                <p className="text-sm font-medium">Aadhaar Card</p>
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={currentItem.aadhaarCardUrl} target="_blank" rel="noopener noreferrer">View</a>
                                                </Button>
                                            </div>
                                        )}
                                        {'electricityBillUrl' in currentItem && currentItem.electricityBillUrl && (
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-8 h-8 text-blue-600"/>
                                                <p className="text-sm font-medium">Electricity Bill</p>
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={currentItem.electricityBillUrl} target="_blank" rel="noopener noreferrer">View</a>
                                                </Button>
                                            </div>
                                        )}
                                        {'nocUrl' in currentItem && currentItem.nocUrl && (
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-8 h-8 text-blue-600"/>
                                                <p className="text-sm font-medium">NOC</p>
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={currentItem.nocUrl} target="_blank" rel="noopener noreferrer">View</a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-slate-50 rounded-md space-y-1">
                                    <strong className="block text-sm font-medium text-muted-foreground">ID</strong>
                                    <div>{currentItem.id}</div>
                                </div>
                                 <div className="p-3 bg-slate-50 rounded-md space-y-1">
                                    <strong className="block text-sm font-medium text-muted-foreground flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> Vendor Number</strong>
                                    <div className="font-mono">{'vendorNumber' in currentItem ? currentItem.vendorNumber || 'N/A' : 'N/A'}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-md space-y-1">
                                    <strong className="block text-sm font-medium text-muted-foreground">Type</strong>
                                    <div className="capitalize">{currentItem.propertyType}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-md space-y-1">
                                    <strong className="block text-sm font-medium text-muted-foreground">Locality</strong>
                                    <div>{currentItem.locality}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-md space-y-1">
                                    <strong className="block text-sm font-medium text-muted-foreground">Status</strong>
                                    <StatusBadge status={currentItem.status} />
                                </div>

                                <div className="p-3 bg-slate-50 rounded-md space-y-1">
                                    <strong className="block text-sm font-medium text-muted-foreground flex items-center gap-1.5"><UserIcon className="w-4 h-4" /> Owner/User Name</strong>
                                    <div>{currentItem.ownerName}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-md space-y-1">
                                    <strong className="block text-sm font-medium text-muted-foreground flex items-center gap-1.5"><Phone className="w-4 h-4" /> Phone Number</strong>
                                    <div>{currentItem.contactPhonePrimary}</div>
                                </div>
                                <div className="md:col-span-2 p-3 bg-slate-50 rounded-md space-y-1">
                                    <strong className="block text-sm font-medium text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Full Address</strong>
                                    <div>{currentItem.completeAddress}</div>
                                </div>

                                {('description' in currentItem && currentItem.description) && (
                                    <div className="md:col-span-2 p-3 bg-slate-50 rounded-md space-y-1">
                                        <strong className="block text-sm font-medium text-muted-foreground">Description</strong>
                                        <div>{currentItem.description}</div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Close</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the item.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteItem(currentItem.id, currentItem.propertyType)}>Confirm Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                {currentItem.status !== 'rejected' && <Button variant="secondary" onClick={() => handleUpdateStatus(currentItem.id, currentItem.propertyType, 'rejected')}><XCircle className="w-4 h-4 mr-2" />Reject</Button>}
                                {currentItem.status !== 'approved' && <Button onClick={() => handleUpdateStatus(currentItem.id, currentItem.propertyType, 'approved')}><CheckCircle className="w-4 h-4 mr-2" />Approve</Button>}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}