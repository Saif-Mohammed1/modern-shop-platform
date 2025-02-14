// Purpose: Update the query parameters of the URL
import { useRouter } from "next/navigation";

type Params = {
  [key: string]: string | number;
};

export const updateQueryParams = (
  params: Params,
  searchParamsReadOnly: URLSearchParams,
  router: ReturnType<typeof useRouter>,
  pathName: string
): void => {
  const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
  for (const key in params) {
    if (params[key] === "") {
      paramsSearch.delete(key);
    } else {
      const value = params[key].toString(); // Ensure the value is a string

      paramsSearch.set(key, value);
    }
  }

  router.push(pathName + "?" + paramsSearch.toString());
};
