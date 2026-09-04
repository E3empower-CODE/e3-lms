import { useCallback, useEffect, useState } from 'react'

/**
 * Run an async function and expose the four data-states. Re-runs whenever
 * `deps` change. Returns { status, data, error, retry, setData }.
 *
 * @param {() => Promise<any>} asyncFn
 * @param {any[]} deps
 */
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })

  // asyncFn is intentionally excluded; callers pass a stable `deps` list.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(asyncFn, deps)

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null })
    try {
      const data = await run()
      setState({ status: 'success', data, error: null })
    } catch (error) {
      setState({ status: 'error', data: null, error })
    }
  }, [run])

  useEffect(() => {
    let active = true
    setState({ status: 'loading', data: null, error: null })
    run()
      .then((data) => active && setState({ status: 'success', data, error: null }))
      .catch((error) => active && setState({ status: 'error', data: null, error }))
    return () => {
      active = false
    }
  }, [run])

  const setData = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      data: typeof updater === 'function' ? updater(prev.data) : updater,
    }))
  }, [])

  return { ...state, retry: load, setData }
}
