import { AchievementsList } from './AchievementsList'

interface AchievementsSectionProps {
  userId: string
}

export async function AchievementsSection({ userId }: AchievementsSectionProps) {
  return <AchievementsList userId={userId} />
}
