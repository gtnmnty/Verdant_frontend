"use client"

import {useEffect, useState} from "react";
import {GET_BRANCHES} from "@/lib/queries";
import {gqlRequest} from "@/utils/graphqlClient";


export interface BranchOption {
    id: string;
    name: string;
}

export function useBranches(){
    const [branches, setBranches] = useState<BranchOption[]>([])
    const [loading, setLoading] =  useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false;

        async function load(){
            try{
                const data = await gqlRequest<{ branches: BranchOption[] }>(GET_BRANCHES);
                if (!cancelled) setBranches(data.branches ?? []);
            } catch (e) {
                const message = e instanceof Error ? e.message : "Couldn't load branches";
                console.error("useBranches:", e);
                if (!cancelled) setError(message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load()

        return () => { cancelled = true }
    }, [])

    return { branches, loading, error }
}