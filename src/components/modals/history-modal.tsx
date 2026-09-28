"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { IndianRupee, Loader2 } from "lucide-react";
import { getMyPurchases, PurchaseRecord } from "@/lib/api"; // Adjust import path if needed

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Note: We removed the static `purchases` prop because the modal now fetches its own live data.
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getMyPurchases()
        .then(data => {
          setHistory(data);
        })
        .catch(err => console.error("Failed to fetch purchases", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Purchase History</DialogTitle>
          <DialogDescription className="text-center">
            Here's a list of all your plan purchases on SetMyStay.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ScrollArea className="h-72">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Plan</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                 <TableCell colSpan={3} className="text-center py-8">
                                     <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                 </TableCell>
                             </TableRow>
                        ) : history.length > 0 ? (
                             history.map(purchase => (
                                <TableRow key={purchase.id}>
                                    <TableCell className="font-medium">{purchase.plan_name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(purchase.created_at), "dd MMM, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold flex items-center justify-end">
                                        <IndianRupee className="w-4 h-4 mr-1"/>
                                        {parseFloat(purchase.amount).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                    You haven't made any purchases yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}