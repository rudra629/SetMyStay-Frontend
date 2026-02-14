

"use client";

import React from "react";
import Link from "next/link";
import { Menu, X, Crown, User, Home, Users, Building, BedDouble, PlusCircle, Heart, LogOut, History, Briefcase, CheckCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Page } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavLinkProps {
  page: Page;
  activePage: Page;
  onClick: (page: Page) => void;
  children: React.ReactNode;
  isMobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ page, activePage, onClick, children, isMobile }) => {
  const isActive = activePage === page;
  
  if (isMobile) {
    return (
      <SheetClose asChild>
        <button
          onClick={() => onClick(page)}
          className={cn(
            "flex items-center w-full p-3 rounded-lg gap-3 transition-colors",
            isActive ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted"
          )}
        >
          {children}
        </button>
      </SheetClose>
    );
  }

  return (
    <button
      onClick={() => onClick(page)}
      className={cn(
        "relative py-2 text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-foreground/60"
      )}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
};

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onSignInClick: () => void;
  onSubscriptionClick: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onHistoryClick: () => void;
}

export function Header({ 
  activePage, 
  setActivePage, 
  onSignInClick, 
  onSubscriptionClick, 
  isLoggedIn, 
  onLogout, 
  onHistoryClick,
}: HeaderProps) {

  const navItems = [
    { page: 'home' as Page, label: 'Home', icon: <Home className="w-5 h-5" /> },
    { page: 'pg' as Page, label: 'PG Listings', icon: <BedDouble className="w-5 h-5" /> },
    { page: 'rentals' as Page, label: 'Rentals', icon: <Building className="w-5 h-5" /> },
    { page: 'roommates' as Page, label: 'Roommates', icon: <Users className="w-5 h-5" /> },
    { page: 'list' as Page, label: 'List Property', icon: <PlusCircle className="w-5 h-5" /> },
  ];
  
  const UserMenu = () => (
    <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button variant="ghost" className="relative h-10 w-10 rounded-full">
           <Avatar className="h-10 w-10">
             <AvatarImage src="https://placehold.co/100x100/4582EF/FFFFFF.png" alt="User" />
             <AvatarFallback>U</AvatarFallback>
           </Avatar>
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent className="w-56" align="end" forceMount>
         <DropdownMenuLabel>My Account</DropdownMenuLabel>
         <DropdownMenuSeparator />
         <DropdownMenuItem onSelect={() => setActivePage('my-properties')}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>My Properties</span>
         </DropdownMenuItem>
          <DropdownMenuItem onSelect={onHistoryClick}>
            <History className="mr-2 h-4 w-4" />
            <span>Purchase History</span>
          </DropdownMenuItem>
         <DropdownMenuItem onSelect={() => setActivePage('liked-properties')}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Liked Properties</span>
          </DropdownMenuItem>
        <DropdownMenuSeparator />
         <DropdownMenuItem onSelect={onLogout}>
           <LogOut className="mr-2 h-4 w-4" />
           <span>Log out</span>
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
  );

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setActivePage('home')}>
            <Logo className="h-8 w-8 md:h-10 md:w-10" />
            <span className="text-lg font-bold md:text-xl text-gray-800">SetMyStay</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map(item => (
            <NavLink key={item.page} page={item.page} activePage={activePage} onClick={setActivePage}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="default" size="sm" onClick={onSubscriptionClick}>
              <Crown className="w-4 h-4 mr-2" />
              Pricing
            </Button>
            {isLoggedIn ? (
               <UserMenu />
            ) : (
              <Button variant="default" size="sm" onClick={onSignInClick}>
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
          
          {/* Mobile menu */}
          <div className="flex items-center gap-2 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
                  <div className="flex items-center justify-between p-6 pb-4">
                     <SheetClose asChild>
                       <Link href="/" className="flex items-center gap-2" onClick={() => setActivePage('home')}>
                         <Logo className="w-8 h-8" />
                         <span className="text-lg font-semibold text-gray-800">SetMyStay</span>
                       </Link>
                     </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose>
                  </div>

                  <ScrollArea className="flex-grow px-6">
                    <nav className="flex flex-col gap-2">
                      {navItems.map(item => (
                        <NavLink key={item.page} page={item.page} activePage={activePage} onClick={setActivePage} isMobile>
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </NavLink>
                      ))}
                    </nav>
                  </ScrollArea>
                  
                  <div className="flex flex-col gap-2 border-t p-6 mt-auto">
                    {!isLoggedIn && (
                      <SheetClose asChild>
                        <Button variant="default" onClick={onSignInClick}>
                          <User className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <Button onClick={onSubscriptionClick}>
                        <Crown className="w-4 h-4 mr-2"/>
                        Pricing
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            
            {isLoggedIn && <UserMenu />}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
