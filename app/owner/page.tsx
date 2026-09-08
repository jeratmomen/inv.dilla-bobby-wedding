import {isOwner} from "@/lib/server";
import Dashboard from "./dashboard";
export const dynamic="force-dynamic";
export default async function Page(){if(!await isOwner())return <main>Silakan masuk sebagai pemilik.</main>;return <Dashboard/>}
