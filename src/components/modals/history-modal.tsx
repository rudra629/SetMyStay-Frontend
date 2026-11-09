"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndianRupee } from "lucide-react";
import { getMyPurchases } from "@/lib/api";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchases?: any[];
}

export function HistoryModal({ isOpen, onClose, purchases = [] }: HistoryModalProps) {
  const [allPurchases, setAllPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Read local purchase history saved after Razorpay checkout
    let localItems: any[] = [];
    try {
      const saved = localStorage.getItem("setmystay_purchase_history");
      if (saved) localItems = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    // Combine prop purchases + localStorage purchases
    const combinedLocal = [...purchases, ...localItems];

    // 2. Also fetch from backend and merge
    getMyPurchases()
      .then((backendData) => {
        const mappedBackend = (backendData || []).map((item: any) => ({
          id: item.id || item.razorpay_payment_id || Math.random().toString(),
          plan: item.plan_name || item.plan || "Subscription Plan",
          date: item.created_at || item.date || new Date().toISOString(),
          amount: item.amount,
        }));

        const merged = [...mappedBackend, ...combinedLocal];
        // Deduplicate by id
        const unique = Array.from(new Map(merged.map((p) => [p.id || `${p.plan}-${p.date}`, p])).values());
        setAllPurchases(unique);
      })
      .catch(() => {
        const unique = Array.from(new Map(combinedLocal.map((p) => [p.id || `${p.plan}-${p.date}`, p])).values());
        setAllPurchases(unique);
      });
  }, [isOpen, purchases]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Purchase History</DialogTitle>
          <DialogDescription className="text-center">
            Here&apos;s a list of all your plan purchases on SetMyStay.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    You haven&apos;t made any purchases yet.
                  </TableCell>
                </TableRow>
              ) : (
                allPurchases.map((item, idx) => {
                  const planTitle = item.plan || item.plan_name || "Unlock Plan";
                  const rawDate = item.date || item.created_at;
                  const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <TableRow key={item.id || idx}>
                      <TableCell className="font-medium">{planTitle}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className="inline-flex items-center justify-end">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                          {item.amount}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}