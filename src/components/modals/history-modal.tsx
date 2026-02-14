
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Purchase } from "@/lib/types";
import { format } from "date-fns";
import { IndianRupee, Calendar } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchases: Purchase[];
}

export function HistoryModal({ isOpen, onClose, purchases }: HistoryModalProps) {
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
                        {purchases.length > 0 ? (
                             purchases.map(purchase => (
                                <TableRow key={purchase.id}>
                                    <TableCell className="font-medium">{purchase.planName}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(purchase.date, "dd MMM, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold flex items-center justify-end">
                                        <IndianRupee className="w-4 h-4 mr-1"/>
                                        {purchase.amount}
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
