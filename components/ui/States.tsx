import React from 'react';
import { Loader2, AlertCircle, WifiOff, Inbox } from 'lucide-react';

export function LoadingState({ message = 'Loading content...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-neutral-500">
      <Loader2 className="w-6 h-6 animate-spin mb-3 text-neutral-950" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({ title = 'No content found', description = 'Check back later for updates.' }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-500">
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-950 mb-4">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-neutral-950 text-base mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 max-w-sm">{description}</p>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message = 'Unable to load data at this time.', onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-red-600">
      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-neutral-950 text-base mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-medium hover:bg-neutral-800 transition-colors">
          Try Again
        </button>
      )}
    </div>
  );
}

export function OfflineState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-500">
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-950 mb-4">
        <WifiOff className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-neutral-950 text-base mb-1">You are offline</h3>
      <p className="text-xs text-neutral-500 max-w-sm">Please check your internet connection to continue browsing Harmonics.</p>
    </div>
  );
}
