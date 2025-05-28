// import { useCallback } from "react"
// import { useCustomFetch } from "src/hooks/useCustomFetch"
// import { SetTransactionApprovalParams } from "src/utils/types"
// import { TransactionPane } from "./TransactionPane"
// import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

// export const Transactions: TransactionsComponent = ({ transactions }) => {
//   const { fetchWithoutCache, loading } = useCustomFetch()

//   const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
//     async ({ transactionId, newValue }) => {
//       await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
//         transactionId,
//         value: newValue,
//       })
//     },
//     [fetchWithoutCache]
//   )

//   if (transactions === null) {
//     return <div className="RampLoading--container">Loading...</div>
//   }

//   return (
//     <div data-testid="transaction-container">
//       {transactions.map((transaction) => (
//         <TransactionPane
//           key={transaction.id}
//           transaction={transaction}
//           loading={loading}
//           setTransactionApproval={setTransactionApproval}
//         />
//       ))}
//     </div>
//   )
// }
import { useCallback } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { Transaction, SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { data } from "src/utils/requests" // shared mock data object

// Inline prop types
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
      // Update via fakeFetch
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      // Persist to shared mock data reference
      const globalTransaction = data.transactions.find((t) => t.id === transactionId)
      if (globalTransaction) {
        globalTransaction.approved = newValue
      }

      // Invalidate caches for all employee & filtered views
      clearCacheByEndpoint(["paginatedTransactions", "transactionsByEmployee"])

      // Trigger optional reload from parent
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
