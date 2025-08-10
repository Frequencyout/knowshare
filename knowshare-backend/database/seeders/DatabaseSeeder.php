<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tag;
use App\Models\Question;
use App\Models\Answer;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            TagSeeder::class,
            BadgeSeeder::class,
        ]);

        $tags = collect([
            ['name' => 'Laravel', 'slug' => 'laravel'],
            ['name' => 'React', 'slug' => 'react'],
            ['name' => 'MySQL', 'slug' => 'mysql'],
        ])->map(fn ($t) => Tag::firstOrCreate(['slug' => $t['slug']], $t));

        $question = Question::create([
            'user_id' => $user->id,
            'title' => 'How to set up Sanctum with SPA?',
            'body_markdown' => 'Having trouble with sessions. Any tips?',
            'body_html' => null,
            'slug' => 'how-to-set-up-sanctum-with-spa-'.substr(str_shuffle('abcdef0123456789'), 0, 6),
            'score' => 0,
            'views' => 0,
            'is_closed' => false,
        ]);
        $question->tags()->sync($tags->pluck('id'));

        Answer::create([
            'question_id' => $question->id,
            'user_id' => $user->id,
            'body_markdown' => 'Enable statefulApi middleware and call /sanctum/csrf-cookie from frontend.',
            'body_html' => null,
            'score' => 0,
            'is_accepted' => false,
        ]);
    }
}
