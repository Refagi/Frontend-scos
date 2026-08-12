import { useEffect, useCallback } from 'react'
import { create } from 'zustand'
import Pusher from 'pusher-js'
import { useAuthStore } from '@/store/authStore'
import { notifikasiApi } from '@/lib/api/notifikasi.api'
import type { NotifikasiResponse } from '@/lib/api/types'

interface NotifStore {
  items:       NotifikasiResponse[]
  setAll:      (items: NotifikasiResponse[]) => void
  addOne:      (item: NotifikasiResponse) => void
  markRead:    (id: string) => void
  markAllRead: () => void
  clearAll:    () => void
}

export const useNotifStore = create<NotifStore>((set) => ({
  items:       [],
  setAll:      (items) => set({ items }),
  addOne:      (item)  => set((s) => ({ items: [item, ...s.items].slice(0, 50) })),
  markRead:    (id)    => set((s) => ({ items: s.items.map((n) => n.id === id ? { ...n, isRead: true } : n) })),
  markAllRead: ()      => set((s) => ({ items: s.items.map((n) => ({ ...n, isRead: true })) })),
  clearAll:    ()      => set({ items: [] }),
}))


export const useJumlahBelumDibaca = () =>
  useNotifStore((s) => s.items.filter((n) => !n.isRead).length)


export function useNotifikasiSSE() {
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    notifikasiApi.getDaftar()
      .then(res => {
        useNotifStore.getState().setAll(res.data?.data ?? [])
      })
      .catch(() => {})

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY as string, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER as string ?? 'ap1',
    })

    const channel = pusher.subscribe(`user-${user.id}`)

    channel.bind('notifikasi', (data: NotifikasiResponse) => {
      useNotifStore.getState().addOne(data)
    })

    pusher.connection.bind('connected', () => {
      console.log('[Pusher] Koneksi realtime terbuka')
    })
    pusher.connection.bind('disconnected', () => {
      console.warn('[Pusher] Koneksi realtime terputus, reconnecting...')
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`user-${user.id}`)
      pusher.disconnect()
    }
  }, [isAuthenticated, user?.id])
}


export function useNotifikasi() {
  const items       = useNotifStore((s) => s.items)
  const markRead    = useNotifStore((s) => s.markRead)
  const markAllRead = useNotifStore((s) => s.markAllRead)
  const clearAll    = useNotifStore((s) => s.clearAll)

  const tandaiDibaca = useCallback(async (notifId: string) => {
    markRead(notifId)
    try { await notifikasiApi.tandaiDibaca(notifId) } catch {}
  }, [markRead])

  const tandaiSemuaDibaca = useCallback(async () => {
    markAllRead()
    try { await notifikasiApi.tandaiSemuaDibaca() } catch {}
  }, [markAllRead])

  const hapusSemua = useCallback(async () => {
    clearAll()
    try { await notifikasiApi.hapusSemua() } catch {}
  }, [clearAll])

  return {
    notifikasi:        items,
    jumlahBelumDibaca: items.filter((n) => !n.isRead).length,
    tandaiDibaca,
    tandaiSemuaDibaca,
    hapusSemua,
  }
}

export type { NotifikasiResponse }