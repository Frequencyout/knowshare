<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'name' => 'First Question',
                'slug' => 'first-question',
                'description' => 'Asked your first question',
                'icon' => '❓',
                'color' => '#bronze',
                'type' => 'bronze',
                'requirements' => ['questions_count' => 1],
            ],
            [
                'name' => 'Curious',
                'slug' => 'curious',
                'description' => 'Asked 10 questions',
                'icon' => '🤔',
                'color' => '#bronze',
                'type' => 'bronze',
                'requirements' => ['questions_count' => 10],
            ],
            [
                'name' => 'First Answer',
                'slug' => 'first-answer',
                'description' => 'Posted your first answer',
                'icon' => '💬',
                'color' => '#bronze',
                'type' => 'bronze',
                'requirements' => ['answers_count' => 1],
            ],
            [
                'name' => 'Helper',
                'slug' => 'helper',
                'description' => 'Posted 10 answers',
                'icon' => '🤝',
                'color' => '#bronze',
                'type' => 'bronze',
                'requirements' => ['answers_count' => 10],
            ],
            [
                'name' => 'Expert',
                'slug' => 'expert',
                'description' => 'Posted 50 answers',
                'icon' => '👨‍🎓',
                'color' => '#silver',
                'type' => 'silver',
                'requirements' => ['answers_count' => 50],
            ],
            [
                'name' => 'Accepted',
                'slug' => 'accepted',
                'description' => 'Had your first answer accepted',
                'icon' => '✅',
                'color' => '#bronze',
                'type' => 'bronze',
                'requirements' => ['accepted_answers_count' => 1],
            ],
            [
                'name' => 'Helpful',
                'slug' => 'helpful',
                'description' => 'Had 10 answers accepted',
                'icon' => '🌟',
                'color' => '#silver',
                'type' => 'silver',
                'requirements' => ['accepted_answers_count' => 10],
            ],
            [
                'name' => 'Guru',
                'slug' => 'guru',
                'description' => 'Had 25 answers accepted',
                'icon' => '🏆',
                'color' => '#gold',
                'type' => 'gold',
                'requirements' => ['accepted_answers_count' => 25],
            ],
            [
                'name' => 'Popular',
                'slug' => 'popular',
                'description' => 'Received 100 total upvotes',
                'icon' => '👍',
                'color' => '#silver',
                'type' => 'silver',
                'requirements' => ['total_votes' => 100],
            ],
            [
                'name' => 'Trusted',
                'slug' => 'trusted',
                'description' => 'Reached 1000 reputation',
                'icon' => '🔱',
                'color' => '#gold',
                'type' => 'gold',
                'requirements' => ['reputation' => 1000],
            ],
            [
                'name' => 'Veteran',
                'slug' => 'veteran',
                'description' => 'Member for over a year',
                'icon' => '🎖️',
                'color' => '#gold',
                'type' => 'gold',
                'requirements' => ['days_registered' => 365],
            ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['slug' => $badge['slug']],
                $badge
            );
        }
    }
}
