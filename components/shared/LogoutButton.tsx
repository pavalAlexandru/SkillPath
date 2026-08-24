"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/server/supabase/auth";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push("/login");
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <Button
            onClick={handleLogout}
            variant="outline"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 !px-3 !py-1.5"
        >
            Deconectare
        </Button>
    );
}
