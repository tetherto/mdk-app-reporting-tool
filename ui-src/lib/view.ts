import type { QueryView } from "@tetherto/mdk-react-adapter";
import { useMemo } from "react";

/**
 * `view` with its data shaped by `shape`, once per response: the result only
 * changes when the data does. Pass a stable `shape` (module-level or useCallback).
 */
export function useShaped<T, U>(view: QueryView<T>, shape: (data: T) => U): QueryView<U> {
  const data = view.status === "ready" ? view.data : undefined;
  const shaped = useMemo(
    () => (data === undefined ? undefined : { value: shape(data) }),
    [data, shape],
  );
  if (view.status === "error") return view;
  if (shaped === undefined) return { status: "loading" };
  return { status: "ready", data: shaped.value };
}
