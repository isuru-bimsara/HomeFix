"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Briefcase, Building2, ClipboardList, LayoutDashboard, MessageSquareText, Settings, ShieldCheck, Users } from "lucide-react";

const items=[
  ["/dashboard","Overview",LayoutDashboard],["/dashboard/users","All users",Users],["/dashboard/customers","Customers",Users],
  ["/dashboard/service-providers","Service providers",Briefcase],["/dashboard/insurance-partners","Insurance partners",Building2],
  ["/dashboard/bookings","Bookings",BookOpen],["/dashboard/reviews","Reviews",MessageSquareText],
  ["/dashboard/insurance-claims","Insurance claims",ClipboardList],["/dashboard/settings","Settings",Settings],
] as const;

export default function Sidebar(){const path=usePathname();return <aside className="sidebar"><div className="brand"><span className="brand-mark"><ShieldCheck size={25}/></span><div><strong>HomeFix</strong><small>ADMIN CONSOLE</small></div></div><nav>{items.map(([href,label,Icon])=>{const active=href==="/dashboard"?path===href:path.startsWith(href);return <Link key={href} href={href} className={active?"nav-link active":"nav-link"}><Icon size={19}/><span>{label}</span></Link>})}</nav><div className="sidebar-foot"><BarChart3 size={20}/><div><b>Live operations</b><small>Connected to HomeFix API</small></div></div></aside>}
