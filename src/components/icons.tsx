
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="48" height="48" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="hsl(var(--foreground))" floodOpacity="0.2"/>
        </filter>
      </defs>

      <rect width="120" height="120" rx="20" fill="hsl(var(--primary))"/>
      
      <g transform="translate(0, -5)">
        <ellipse cx="60" cy="80" rx="25" ry="5" fill="hsl(var(--primary))" opacity="0.4" />
        <circle cx="60" cy="51" r="25" fill="hsl(var(--primary-foreground))" />
        <path d="M60 32C49.507 32 41 40.507 41 51C41 65.5 60 78 60 78C60 78 79 65.5 79 51C79 40.507 70.493 32 60 32Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5"/>
        <g strokeWidth="1.5" stroke="hsl(var(--primary-foreground))" fill="hsl(var(--primary))">
            <path d="M60 43.5L53 49.5V58.5H67V49.5L60 43.5Z" />
            <rect x="58" y="54.5" width="4" height="4" rx="0.5" />
        </g>
      </g>
      
      <text 
        x="60" 
        y="98" 
        textAnchor="middle" 
        fontFamily="Inter, sans-serif" 
        fontSize="14" 
        fontWeight="600" 
        fill="hsl(var(--primary-foreground))" 
        letterSpacing="0.5"
      >
        SetMyStay
      </text>
    </svg>
  );
}


export function LoadingSpinner({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
      {...props}
    >
      <style>{`
        .spinner_V8m1{transform-origin:center;animation:spinner_zKoa 2s linear infinite}
        .spinner_V8m1 circle{stroke-linecap:round;animation:spinner_YpOn 1.5s ease-in-out infinite}
        @keyframes spinner_zKoa{100%{transform:rotate(360deg)}}
        @keyframes spinner_YpOn{0%{stroke-dasharray:0 150;stroke-dashoffset:0}47.5%{stroke-dasharray:42 150;stroke-dashoffset:-16}95%,100%{stroke-dasharray:42 150;stroke-dashoffset:-59}}
      `}</style>
      <g className="spinner_V8m1">
        <circle cx="12" cy="12" r="9.5" fill="none" strokeWidth="2"></circle>
      </g>
    </svg>
  );
}
