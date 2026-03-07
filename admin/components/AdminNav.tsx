'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { LogoutButton } from './LogoutButton'

const MAIN_LINKS: { href: string; label: string }[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/users', label: 'Users' },
    { href: '/images', label: 'Images' },
    { href: '/captions', label: 'Captions' },
]

const MORE_LINKS: { href: string; label: string }[] = [
    { href: '/caption-requests', label: 'Caption requests' },
    { href: '/caption-examples', label: 'Caption examples' },
    { href: '/humor-flavors', label: 'Flavors' },
    { href: '/humor-flavor-steps', label: 'Flavor steps' },
    { href: '/humor-mix', label: 'Humor mix' },
    { href: '/terms', label: 'Terms' },
    { href: '/llm-models', label: 'LLM models' },
    { href: '/llm-providers', label: 'LLM providers' },
    { href: '/llm-prompt-chains', label: 'Prompt chains' },
    { href: '/llm-responses', label: 'LLM responses' },
    { href: '/allowed-signup-domains', label: 'Signup domains' },
    { href: '/whitelist-emails', label: 'Whitelist emails' },
]

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
    return (
        <Link
            href={href}
            className={`
                rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${isActive
                    ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }
            `}
        >
            {label}
        </Link>
    )
}

export function AdminNav() {
    const pathname = usePathname()
    const [moreOpen, setMoreOpen] = useState(false)
    const moreRef = useRef<HTMLDivElement>(null)

    const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    const activeInMore = MORE_LINKS.some((l) => isActive(l.href))

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    <nav className="flex items-center gap-1">
                        {MAIN_LINKS.map((l) => (
                            <NavLink key={l.href} href={l.href} label={l.label} isActive={isActive(l.href)} />
                        ))}
                        <div className="relative ml-2" ref={moreRef}>
                            <button
                                type="button"
                                onClick={() => setMoreOpen((o) => !o)}
                                className={`
                                    flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors
                                    ${moreOpen || activeInMore
                                        ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                                        : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                                    }
                                `}
                            >
                                More
                                <svg className="w-4 h-4 transition-transform" style={{ transform: moreOpen ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {moreOpen && (
                                <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-xl">
                                    {MORE_LINKS.map((l) => (
                                        <Link
                                            key={l.href}
                                            href={l.href}
                                            onClick={() => setMoreOpen(false)}
                                            className={`
                                                block px-4 py-2 text-sm transition-colors
                                                ${isActive(l.href)
                                                    ? 'bg-amber-500/20 text-amber-400'
                                                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                                                }
                                            `}
                                        >
                                            {l.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-600">
                        <a
                            href={process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://humor-project-wine.vercel.app'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            View main site
                        </a>
                        <LogoutButton />
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Admin</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
