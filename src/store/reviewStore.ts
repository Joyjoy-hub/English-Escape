import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type ReviewItem = {
  id: string
  missionId: string
  mine: string
  natural: string
  createdAt: string
}

export type ReviewDraft = {
  missionId: string
  mine: string
  natural: string
}

type ReviewState = {
  items: ReviewItem[]
}

type ReviewActions = {
  addReviewItems: (items: ReviewDraft[]) => void
  removeReviewItem: (id: string) => void
  clearAll: () => void
}

function pairKey(mine: string, natural: string) {
  return `${mine}\0${natural}`
}

export const useReviewStore = create<ReviewState & ReviewActions>()(
  persist(
    (set) => ({
      items: [],

      addReviewItems: (items) =>
        set((state) => {
          const seen = new Set(state.items.map((item) => pairKey(item.mine, item.natural)))
          const additions: ReviewItem[] = []

          for (const item of items) {
            const key = pairKey(item.mine, item.natural)
            if (seen.has(key)) continue
            seen.add(key)
            additions.push({
              id: crypto.randomUUID(),
              missionId: item.missionId,
              mine: item.mine,
              natural: item.natural,
              createdAt: new Date().toISOString(),
            })
          }

          if (additions.length === 0) return state
          return { items: [...state.items, ...additions] }
        }),

      removeReviewItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'english-escape-review',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
