
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, GitPullRequest, Inbox, ShoppingBag, Settings, LogOut, ChevronLeft, ChevronRight, Sparkles, MessageSquare as MessageSquareCode, Tags } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/admin/dashboard' },
    { icon: Users, label: 'Leads', path: '/admin/leads' },
    { icon: GitPullRequest, label: 'Pipeline', path: '/admin/pipeline' },
    { icon: Inbox, label: 'Caixa de Entrada', path: '/admin/inbox' },
    { icon: ShoppingBag, label: 'Catálogo', path: '/admin/offers' },
    { icon: Tags, label: 'Categorias & Tags', path: '/admin/catalog' },
    { icon: MessageSquareCode, label: 'Prompts', path: '/admin/prompts' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  return (
    <motion.div 
      animate={{ width: collapsed ? 80 : 250 }}
      className="h-screen bg-[var(--bg-secondary)] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 shadow-xl"
    >
      <div className="p-4 flex items-center justify-between border-b border-white/5 h-16">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center gap-2"
          >
             <div className="bg-[var(--accent-orange)] p-1 rounded-md text-white">
                <Sparkles size={16} fill="currentColor" />
             </div>
             <span className="text-lg font-bold text-white">Conecta<span className="text-[var(--accent-orange)]">Leads</span></span>
          </motion.div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-white/10 rounded-md text-gray-400 mx-auto md:mx-0"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
              isActive 
                ? "text-white font-medium bg-white/5" 
                : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-orange)] rounded-r-full"
                    initial={false}
                  />
                )}
                <item.icon size={22} className={cn("shrink-0 z-10", isActive ? "text-[var(--accent-orange)]" : "text-gray-500 group-hover:text-white")} />
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="whitespace-nowrap z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-red-900/10 hover:text-red-500 transition-colors"
        >
          <LogOut size={22} className="shrink-0" />
          {!collapsed && (
             <motion.span 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="font-medium"
             >
               Sair
             </motion.span>
           )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
