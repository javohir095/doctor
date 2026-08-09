import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { InventoryItem } from "@/entities/inventory/model/types"

export function useInventoryItems(search: string, category: string) {
  return useQuery({
    queryKey: ["inventory_items", { search, category }],
    queryFn: async (): Promise<InventoryItem[]> => {
      let query = supabase.from("inventory_items").select("*").order("name")
      if (search.trim()) query = query.ilike("name", `%${search.trim()}%`)
      if (category !== "all") query = query.eq("category", category)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}
