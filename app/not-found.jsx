// import NotFoundComponent from "@/components/notFound/notFound";
import dynamic from "next/dynamic";
const NotFoundComponent = dynamic(() =>
  import("@/components/notFound/notFound")
);
export const metadata = {
  title: "Not Found",
  description: "Not Found",
  keywords: "Not Found",
};
export default function NotFound() {
  return (
    <div>
      <NotFoundComponent />
    </div>
  );
}
