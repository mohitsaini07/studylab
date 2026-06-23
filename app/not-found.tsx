import Link from "next/link";
import {Button} from "@/components/ui";
import {Logo} from "@/components/logo";
export default function NotFound(){return <main className="grid min-h-screen place-items-center bg-canvas p-6"><div className="text-center"><div className="flex justify-center"><Logo/></div><p className="mt-12 text-sm font-semibold text-brand">404</p><h1 className="mt-2 text-3xl font-semibold">This page took a study break.</h1><p className="mt-3 text-sm text-muted">The page you’re looking for doesn’t exist or has moved.</p><Button asChild className="mt-7"><Link href="/dashboard">Back to dashboard</Link></Button></div></main>}
