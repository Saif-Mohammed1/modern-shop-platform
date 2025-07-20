"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import toast from "react-hot-toast";

// GraphQL Queries and Mutations
const GET_REFUNDS = gql`
  query GetRefunds($page: Int, $limit: Int, $status: RefundStatus) {
    getRefunds(page: $page, limit: $limit, status: $status) {
      docs {
        _id
        invoice_id
        reason
        status
        amount
        created_at
        user {
          name
          email
        }
      }
      meta {
        totalPages
        totalDocs
        page
        limit
      }
    }
  }
`;

const UPDATE_REFUND_STATUS = gql`
  mutation UpdateRefundStatus($id: ID!, $input: UpdateRefundStatusInput!) {
    updateRefundStatus(id: $id, input: $input) {
      _id
      status
      processed_at
      notes
    }
  }
`;

// Response types
interface RefundType {
  _id: string;
  invoice_id: string;
  reason: string;
  status: string;
  amount: number;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

const AdminRefundReview = () => {
  const [page] = useState(1);
  const [status] = useState(null);

  // GraphQL Query
  const { data, loading, error, refetch } = useQuery<{
    getRefunds: {
      docs: RefundType[];
      meta: {
        totalPages: number;
        totalDocs: number;
        page: number;
        limit: number;
      };
    };
  }>(GET_REFUNDS, {
    variables: { page, limit: 10, status },
    fetchPolicy: "cache-and-network",
  });

  // GraphQL Mutation
  const [updateRefundStatus] = useMutation<{
    updateRefundStatus: {
      _id: string;
      status: string;
      processed_at: string;
      notes?: string;
    };
  }>(UPDATE_REFUND_STATUS, {
    onCompleted: () => {
      toast.success("Refund status updated successfully");
      void refetch();
    },
    onError: (error) => {
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        (error.networkError ? "Network error occurred" : null) ||
        "Failed to update refund status";
      toast.error(errorMessage);
    },
  });

  const handleRefundDecision = async (refundId: string, decision: string) => {
    try {
      await updateRefundStatus({
        variables: {
          id: refundId,
          input: {
            status: decision === "accepted" ? "APPROVED" : "REJECTED",
            notes: `Refund ${decision} by admin`,
          },
        },
      });
    } catch (_error) {
      // Error handling is done in onError callback
      // Silent catch to prevent unhandled promise rejection
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center text-red-600">
          <p>Error loading refunds: {error.message}</p>
          <button
            onClick={() => void refetch()}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const refunds: RefundType[] = data?.getRefunds?.docs || [];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Refund Requests</h2>
      {refunds.length === 0 ? (
        <p>No refunds to review.</p>
      ) : (
        refunds.map((refund: RefundType) => (
          <div
            key={refund._id}
            className="p-4 mb-4 border border-gray-300 rounded-lg shadow"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Refund for Invoice: {refund.invoice_id}
              </h3>
              <span
                className={`px-3 py-1 rounded ${
                  refund.status === "PENDING"
                    ? "bg-yellow-500 text-white"
                    : refund.status === "APPROVED"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                }`}
              >
                {refund.status}
              </span>
            </div>
            <p>
              <strong>Customer:</strong> {refund.user?.name} (
              {refund.user?.email})
            </p>
            <p>
              <strong>Amount:</strong> ${refund.amount.toFixed(2)}
            </p>
            <p>
              <strong>Reason:</strong> {refund.reason}
            </p>
            <p className="text-sm text-gray-500">
              Requested on: {new Date(refund.created_at).toLocaleDateString()}
            </p>

            {refund.status === "PENDING" && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleRefundDecision(refund._id, "accepted")}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRefundDecision(refund._id, "refused")}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Refuse
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminRefundReview;
