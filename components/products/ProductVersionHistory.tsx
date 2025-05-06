// components/ProductVersionHistory.tsx
"use client";

import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import type { FC } from "react";
import toast from "react-hot-toast";

import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductTranslate } from "@/public/locales/client/(public)/ProductTranslate";

import Pagination, { type PaginationType } from "../pagination/Pagination";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";

// components/ProductVersionHistory.tsx

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
  const [_currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const router = useRouter();
  const onPaginationChange = (page: number) => {
    void setCurrentPage(page);
  };
  const handleRestore = async (versionId: string) => {
    let loading;
    try {
      loading = toast.loading(
        ProductTranslate[lang].ProductVersionHistory.fun.handleRestore.loading
      );
      await api.post(`/admin/dashboard/products/${slug}/restore`, {
        versionId,
      });
      toast.success(
        ProductTranslate[lang].ProductVersionHistory.fun.handleRestore.success
      );
      // Reload the page
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        (err as Error)?.message ||
          ProductTranslate[lang].ProductVersionHistory.fun.handleRestore.error
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
            <TableHead>{ProductTranslate[lang].Tables.head}</TableHead>
            <TableHead>{ProductTranslate[lang].Tables.date}</TableHead>
            <TableHead>{ProductTranslate[lang].Tables.productName}</TableHead>
            <TableHead>{ProductTranslate[lang].Tables.price}</TableHead>
            <TableHead>{ProductTranslate[lang].Tables.discount}</TableHead>
            <TableHead>{ProductTranslate[lang].Tables.stock}</TableHead>
            <TableHead>{ProductTranslate[lang].Tables.description}</TableHead>
            <TableHead>{ProductTranslate[lang].Tables.actions}</TableHead>
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
                <TableCell>
                  {version.name ?? ProductTranslate[lang].Tables.noValue}
                </TableCell>
                <TableCell>
                  {version.price
                    ? `$${version.price.toFixed(2)}`
                    : ProductTranslate[lang].Tables.noValue}
                </TableCell>
                {/* Add Discount and Description cells */}
                <TableCell>
                  {version.discount
                    ? `$${version.discount.toFixed(2)}`
                    : ProductTranslate[lang].Tables.noValue}
                </TableCell>
                <TableCell>
                  {version.stock ?? ProductTranslate[lang].Tables.noValue}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {version.description ?? ProductTranslate[lang].Tables.noValue}
                </TableCell>
                <TableCell>
                  <ConfirmModal
                    title={ProductTranslate[lang].confirmModal.title}
                    onConfirm={() => handleRestore(version.versionId)}
                  >
                    <Button variant="outline" size="sm">
                      {ProductTranslate[lang].Button.restore}
                    </Button>
                  </ConfirmModal>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                {ProductTranslate[lang].Tables.noVersion}
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
