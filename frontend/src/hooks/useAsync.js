import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Run an async function and expose the four data-states. Re-runs whenever
 * `deps` change, and on `retry()`. Returns { status, data, error, retry, setData }.
 *
 * A monotonic request id guards against races and unmount: only the most
 * recently started request may update state, so a slow response that a newer
 * fetch (deps change, retry) has superseded — or one that resolves after
 * unmount — is discarded.
 *
 * @param {() => Promise<any>} asyncFn
 * @param {any[]} deps
 */
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })

  // asyncFn is intentionally excluded; callers pass a stable `deps` list.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(asyncFn, deps)

  const reqId = useRef(0)

  const load = useCallback(() => {
    const id = ++reqId.current
    setState({ status: 'loading', data: null, error: null })
    run()
      .then((data) => {
        if (id === reqId.current) setState({ status: 'success', data, error: null })
      })
      .catch((error) => {
        if (id === reqId.current) setState({ status: 'error', data: null, error })
      })
  }, [run])

  useEffect(() => {
    load()
    // Invalidate any in-flight request on unmount / before the next run.
    return () => {
      reqId.current += 1
    }
  }, [load])

  const setData = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      data: typeof updater === 'function' ? updater(prev.data) : updater,
    }))
  }, [])

  return { ...state, retry: load, setData }
}
