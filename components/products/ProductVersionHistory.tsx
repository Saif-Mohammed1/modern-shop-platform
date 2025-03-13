// components/ProductVersionHistory.tsx
"use client";

import { FC } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import Button from "../ui/Button";
import Pagination, { PaginationType } from "../pagination/Pagination";
import { parseAsInteger, useQueryState } from "nuqs";
import ConfirmModal from "../ui/ConfirmModal";
import api from "@/app/lib/utilities/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ProductVersion {
  versionId: string;
  timestamp: string;
  name: string;
  price: number;
  discount: number;
  stock: number;
  description: string;
}
type VersionHistoryResponse = {
  slug: string;
  versions: ProductVersion[];
  pagination: PaginationType;
};

const ProductVersionHistory: FC<VersionHistoryResponse> = ({
  slug,
  pagination,
  versions,
}) => {
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const router = useRouter();
  const onPaginationChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleRestore = async (versionId: string) => {
    let loading;
    try {
      loading = toast.loading("Restoring version...");
      await api.post(`/admin/dashboard/products/${slug}/restore`, {
        versionId,
      });
      toast.success("Version restored successfully.");
      // Reload the page
      router.refresh();
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to restore version. Please try again later."
      );
    } finally {
      toast.dismiss(loading);
    }
  };
  return (
    <section className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Version ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Price</TableHead>
            {/* Add Discount and Description headers */}
            <TableHead>Discount</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.length ? (
            versions.map((version) => (
              <TableRow key={version.versionId}>
                <TableCell className="font-medium">
                  <span className="text-muted-foreground">
                    #{version.versionId.slice(-6)}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(version.timestamp).toLocaleDateString()}
                </TableCell>
                <TableCell>{version.name}</TableCell>
                <TableCell>${version.price.toFixed(2)}</TableCell>
                {/* Add Discount and Description cells */}
                <TableCell>${version.discount.toFixed(2)}</TableCell>
                <TableCell>{version.stock}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {version.description}
                </TableCell>
                <TableCell>
                  <ConfirmModal
                    title="Are you sure you want to restore this version? Current data will be replaced."
                    onConfirm={() => handleRestore(version.versionId)}
                  >
                    <Button variant="outline" size="sm">
                      Restore
                    </Button>
                  </ConfirmModal>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No versions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination meta={pagination.meta} onPageChange={onPaginationChange} />
    </section>
  );
};
export default ProductVersionHistory;
