import type { ComponentProps } from "react";
import Link from "next/link";

import { handleRedirect } from "@/app/lib/actions/redirect";

const CustomLink = (
  props:
    | ({ intercept?: true } & ComponentProps<typeof Link>)
    | ({
        intercept: false;
        href: string;
        className?: string;
      } & ComponentProps<"button">)
) => {
  const allowIntercept = props.intercept !== false;

  if (allowIntercept) {
    const { intercept, ...rest } = props;
    return <Link {...rest} />;
  }

  const { href, intercept, className, ...rest } = props;
  return (
    <form
      className={className}
      //   className="contents"
      // This action can be separated out in a different file, to allow using in client components.
      action={() => handleRedirect(href)}
    >
      <button
        {...rest}
        type="submit"
        className="text-center cursor-pointer w-full"
      />
    </form>
  );
};
export default CustomLink;
