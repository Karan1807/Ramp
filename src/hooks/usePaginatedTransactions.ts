
import { useCallback, useState } from "react"
import {
  PaginatedRequestParams,
  PaginatedResponse,
  Transaction,
} from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<
    PaginatedResponse<Transaction[]> | null
  >(null)

  const fetchAll = useCallback(async () => {
    if (paginatedTransactions?.nextPage === null) {
   
      return
    }

    const pageToFetch =
      paginatedTransactions === null ? 0 : paginatedTransactions.nextPage

    const response = await fetchWithCache<
      PaginatedResponse<Transaction[]>,
      PaginatedRequestParams
    >("paginatedTransactions", { page: pageToFetch })

    setPaginatedTransactions((previousResponse) => {
      if (response === null) return previousResponse

      const previousData = previousResponse?.data ?? []

      
      const existingIds = new Set(previousData.map(t => t.id))
      const newTransactions = response.data.filter(t => !existingIds.has(t.id))

      return {
        data: [...previousData, ...newTransactions],
        nextPage: response.nextPage,
      }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return {
    data: paginatedTransactions,
    loading,
    fetchAll,
    invalidateData,
  }
}
