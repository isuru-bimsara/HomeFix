import { AlertCircle, RefreshCw } from "lucide-react";
export function PageHeader({eyebrow="HOMEFIX ADMIN",title,description,action}:{eyebrow?:string;title:string;description:string;action?:React.ReactNode}){return <div className="page-header"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>}
export function Status({value}:{value:string}){return <span className={`status status-${value.toLowerCase().replaceAll("_","-")}`}>{value.replaceAll("_"," ")}</span>}
export function Loading(){return <div className="panel state"><div className="spinner"/>Loading live data...</div>}
export function ErrorState({message,retry}:{message:string;retry:()=>void}){return <div className="panel state error"><AlertCircle/><b>{message}</b><button className="button secondary" onClick={retry}><RefreshCw size={15}/>Retry</button></div>}
export function Empty({text}:{text:string}){return <div className="empty">{text}</div>}
export function date(value?:string){return value?new Date(value).toLocaleString():"—"}
