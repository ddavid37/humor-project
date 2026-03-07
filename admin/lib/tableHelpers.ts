/** Format a value for display in admin tables */
export function cellValue(val: unknown): string {
    if (val == null) return '—'
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    if (typeof val === 'object' && typeof (val as Date).toISOString === 'function') return (val as Date).toISOString().slice(0, 19)
    return String(val)
}
