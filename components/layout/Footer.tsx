import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-neutral-500">
        <div>
          <p className="font-semibold text-neutral-900">Harmonics Platform</p>
          <p className="text-xs text-neutral-400 mt-1">Phase 1 Foundation & Architecture Setup.</p>
        </div>
        <div className="flex items-center gap-6 text-xs text-neutral-600">
          <span>PostgreSQL Ready</span>
          <span>·</span>
          <span>Prisma ORM Prepared</span>
          <span>·</span>
          <span>Secure Admin Guarded</span>
        </div>
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} Harmonics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
