"use client";

import { User, LogOut, Settings, Bell, Shield, Wallet } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function ProfileUI() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  const settingsItems = [
    { icon: <Wallet className="w-5 h-5" />, label: "Ledger Preferences", desc: "Manage sync intervals and default currencies" },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", desc: "Push and email transaction alerts" },
    { icon: <Shield className="w-5 h-5" />, label: "Account Security", desc: "Two-factor authentication and passwords" },
    { icon: <Settings className="w-5 h-5" />, label: "App Settings", desc: "Appearance and accessibility options" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 pb-24 pt-4 px-4">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-serif">Profile</h2>
      </div>

      {/* Identity Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center justify-between bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-sh-md rounded-3xl p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center border border-brand/20">
            <User className="w-7 h-7 text-brand" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground font-serif">Cafe One Admin</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-sans font-semibold mt-1">Active Session</span>
          </div>
        </div>
      </motion.div>

      {/* Settings List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3 mt-2"
      >
        {settingsItems.map((item, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="p-3 bg-muted/50 rounded-xl text-muted-foreground group-hover:text-brand group-hover:bg-brand/10 transition-colors">
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Logout Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Link href="/">
          <button className="w-full py-4 px-6 bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 font-sans border border-destructive/20">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
