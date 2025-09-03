import type { LucideIcon } from "lucide-react"
import { Droplets, Sprout, Gem, Crown } from "lucide-react"
import type { CategoryId } from "@/lib/types"

export type Category = {
  id: CategoryId
  name: string
  icon: LucideIcon   // ← 文字列ではなくコンポーネント参照
  description: string
  color: string
}

export const categories: { id: CategoryId; name: string; icon: string; description: string; color: string }[] = [
  { id: "skincare", name: "スキンケア", icon: "Droplets", description: "美しい肌へ", color: "from-emerald-400 to-emerald-500" },
  { id: "shampoo", name: "シャンプー", icon: "Sprout", description: "髪に優しく", color: "from-blue-400 to-blue-500" },
  { id: "treatment", name: "トリートメント", icon: "Gem", description: "極上のケア", color: "from-purple-400 to-purple-500" },
  { id: "styling", name: "スタイリング", icon: "Crown", description: "理想のスタイル", color: "from-pink-400 to-pink-500" },
]
