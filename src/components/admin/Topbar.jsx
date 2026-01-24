
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Topbar = () => {
  return (
    <div className="h-16 bg-[var(--bg-secondary)] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40 ml-[80px] md:ml-0 w-full shadow-sm">
       {/* Breadcrumbs */}
       <div className="hidden md:block text-[var(--text-secondary)] text-sm font-medium">
         Painel <span className="mx-2 text-gray-600">/</span> <span className="text-white">Visão Geral</span>
       </div>

       <div className="flex items-center gap-4 ml-auto">
         <div className="relative hidden sm:block w-64">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
           <Input 
             placeholder="Buscar..." 
             className="pl-9 bg-[var(--bg-primary)] border-white/10 text-sm focus:border-[var(--accent-orange)]/50 focus:ring-0 text-white placeholder:text-gray-600"
           />
         </div>
         
         <button className="relative p-2 text-gray-400 hover:text-white transition-colors bg-[var(--bg-primary)] rounded-full hover:bg-white/5 border border-white/5">
           <Bell size={18} />
           <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-[var(--bg-secondary)]"></span>
         </button>

         <div className="flex items-center gap-3 pl-4 border-l border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-orange)] to-red-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-[var(--bg-secondary)]">
              AD
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white leading-none mb-1">Usuário Admin</p>
              <p className="text-xs text-[var(--text-secondary)]">admin@conectaleads.com</p>
            </div>
         </div>
       </div>
    </div>
  );
};

export default Topbar;
