import type { LucideIcon } from "lucide-react";
export default function StatCard({label,value,detail,icon:Icon,tone="green"}:{label:string;value:string|number;detail:string;icon:LucideIcon;tone?:string}){return <article className="stat-card"><span className={`stat-icon ${tone}`}><Icon size={22}/></span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>}
