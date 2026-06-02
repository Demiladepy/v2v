"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  label?: string;
}

export function ZoomableImage({
  src,
  alt,
  className,
  label,
}: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={`relative cursor-zoom-in ${className ?? ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
          {label && (
            <div className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {label}
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] border-none bg-black/90 p-0 shadow-none outline-none sm:max-w-3xl [&>button]:text-white">
        <DialogHeader className="sr-only">
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>
        <div className="flex h-[80vh] w-full flex-col items-center justify-center p-4 sm:h-[85vh]">
          {label && (
            <div className="absolute top-4 z-10 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold tracking-wider text-white backdrop-blur-md">
              {label}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
