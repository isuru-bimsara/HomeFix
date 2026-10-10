"use client";
import { Bell, Menu, Search } from "lucide-react";
import { getStoredUser } from "@/lib/storage";
export default function Header({onMenu}:{onMenu:()=>void}){const user=typeof window!=="undefined"?getStoredUser():null;return <header className="topbar"><button className="icon-button mobile-menu" onClick={onMenu}><Menu size={20}/></button><div className="top-search"><Search size={18}/><input aria-label="Search dashboard" placeholder="Search users, bookings, claims..."/></div><div className="top-actions"><button className="icon-button"><Bell size={19}/><span className="notification-dot"/></button><div className="admin-avatar">AD</div><div className="admin-meta"><b>Administrator</b><span>{user?.email||"HomeFix Admin"}</span></div></div></header>}
