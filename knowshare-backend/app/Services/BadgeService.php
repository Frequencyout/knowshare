<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BadgeService
{
    public function checkAndAwardBadges(User $user): array
    {
        $awarded = [];
        $badges = Badge::active()->get();

        foreach ($badges as $badge) {
            if (!$user->badges()->where('badge_id', $badge->id)->exists()) {
                if ($this->meetsBadgeRequirements($user, $badge)) {
                    $user->badges()->attach($badge->id, ['earned_at' => now()]);
                    $awarded[] = $badge;
                }
            }
        }

        return $awarded;
    }

    private function meetsBadgeRequirements(User $user, Badge $badge): bool
    {
        $requirements = $badge->requirements;

        // Check question count
        if (isset($requirements['questions_count'])) {
            $questionCount = $user->questions()->count();
            if ($questionCount < $requirements['questions_count']) {
                return false;
            }
        }

        // Check answer count
        if (isset($requirements['answers_count'])) {
            $answerCount = $user->answers()->count();
            if ($answerCount < $requirements['answers_count']) {
                return false;
            }
        }

        // Check accepted answers count
        if (isset($requirements['accepted_answers_count'])) {
            $acceptedCount = $user->answers()->where('is_accepted', true)->count();
            if ($acceptedCount < $requirements['accepted_answers_count']) {
                return false;
            }
        }

        // Check reputation
        if (isset($requirements['reputation'])) {
            if ($user->reputation < $requirements['reputation']) {
                return false;
            }
        }

        // Check vote score (total upvotes on questions and answers)
        if (isset($requirements['total_votes'])) {
            $questionVotes = DB::table('votes')
                ->whereIn('votable_id', $user->questions()->pluck('id'))
                ->where('votable_type', 'App\Models\Question')
                ->sum('votes');

            $answerVotes = DB::table('votes')
                ->whereIn('votable_id', $user->answers()->pluck('id'))
                ->where('votable_type', 'App\Models\Answer')
                ->sum('votes');

            if (($questionVotes + $answerVotes) < $requirements['total_votes']) {
                return false;
            }
        }

        // Check days since registration
        if (isset($requirements['days_registered'])) {
            $daysSince = $user->created_at->diffInDays(now());
            if ($daysSince < $requirements['days_registered']) {
                return false;
            }
        }

        return true;
    }

    public function getUserBadges(User $user)
    {
        return $user->badges()
            ->orderBy('type', 'desc')
            ->orderBy('user_badges.earned_at', 'desc')
            ->get();
    }
}
