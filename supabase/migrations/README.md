# Database Migrations

## Running Migrations

To apply database migrations to your Supabase project, you have two options:

### Option 1: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Link to your project (if not already linked)
npx supabase link --project-ref your-project-ref

# Apply all pending migrations
npx supabase db push
```

### Option 2: Manual SQL Execution

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the content of the migration file
4. Paste and execute it

## Available Migrations

### create_achievements.sql

Creates the achievements system with:

- **achievements table**: Defines all possible achievements
- **user_achievements table**: Tracks user progress and unlocked achievements
- **RLS policies**: Security policies for data access
- **SQL functions**:
  - `calculate_user_stats()`: Calculates user statistics from activities
  - `update_user_achievements()`: Updates user achievement progress
- **Predefined achievements**: 20+ achievements across 4 categories

**Categories**:
- 🏃 Distance: Based on total distance covered
- 🎯 Activities: Based on number of activities completed
- 🏆 Challenges: Based on challenge participation and wins
- 🔥 Streak: Based on consecutive days of activity

**Tiers**:
- 🥉 Bronze: Entry-level achievements
- 🥈 Silver: Intermediate achievements
- 🥇 Gold: Advanced achievements
- 💎 Platinum: Elite achievements

## How It Works

1. **Sync Activities**: When users sync their Strava activities, the data is stored in `activity_snapshots`
2. **Calculate Progress**: The `update_user_achievements()` function is automatically called after sync
3. **Update Achievements**: The function calculates user stats and updates progress in `user_achievements`
4. **Unlock Achievements**: When progress reaches the requirement value, `unlocked_at` is set
5. **Display**: The frontend fetches and displays achievements with progress bars

## Database Schema

```sql
achievements
- id: UUID (primary key)
- name: TEXT (achievement name)
- description: TEXT (achievement description)
- icon: TEXT (emoji or icon)
- category: TEXT (distance/activities/challenges/streak)
- requirement_type: TEXT (total_distance/activity_count/etc)
- requirement_value: INTEGER (threshold to unlock)
- tier: TEXT (bronze/silver/gold/platinum)

user_achievements
- id: UUID (primary key)
- user_id: UUID (references profiles.id)
- achievement_id: UUID (references achievements.id)
- unlocked_at: TIMESTAMPTZ (null if locked)
- progress: INTEGER (current progress)
```

## After Running the Migration

The achievements system will be fully functional:

1. ✅ Achievements table populated with 20+ predefined achievements
2. ✅ User progress tracking enabled
3. ✅ Automatic progress updates after Strava sync
4. ✅ Frontend displays achievements with progress bars
5. ✅ Achievements grouped by category (Distance, Activities, Challenges, Streak)

## Troubleshooting

If you encounter errors:

1. **RLS Policies**: Make sure you're authenticated when accessing the tables
2. **Foreign Keys**: Ensure `profiles` table exists (should be created during Supabase auth setup)
3. **Permissions**: Verify you have admin access to run migrations
