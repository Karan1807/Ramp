import { useCallback } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { Transaction, SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { data } from "src/utils/requests" // shared mock data object

export type SetTransactionApprovalFunction = (params: {
  transactionId: string
  newValue: boolean
}) => Promise<void>

interface Props {
  transactions: Transaction[] | null
  onTransactionToggled?: () => void | Promise<void>
}

export const Transactions = ({ transactions, onTransactionToggled }: Props) => {
  const { fetchWithoutCache, loading, clearCacheByEndpoint } = useCustomFetch()

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      const globalTransaction = data.transactions.find((t) => t.id === transactionId)
      if (globalTransaction) {
        globalTransaction.approved = newValue
      }
      clearCacheByEndpoint(["paginatedTransactions", "transactionsByEmployee"])

      if (onTransactionToggled) {
        await onTransactionToggled()
      }
    },
    [fetchWithoutCache, onTransactionToggled, clearCacheByEndpoint]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
