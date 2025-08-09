<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'Laravel', 'description' => 'The Laravel PHP Framework'],
            ['name' => 'React', 'description' => 'A JavaScript library for building user interfaces'],
            ['name' => 'JavaScript', 'description' => 'The programming language of the web'],
            ['name' => 'PHP', 'description' => 'A popular general-purpose scripting language'],
            ['name' => 'MySQL', 'description' => 'Open-source relational database management system'],
            ['name' => 'CSS', 'description' => 'Cascading Style Sheets for styling web pages'],
            ['name' => 'HTML', 'description' => 'HyperText Markup Language'],
            ['name' => 'Vue.js', 'description' => 'Progressive JavaScript framework'],
            ['name' => 'Node.js', 'description' => 'JavaScript runtime built on Chrome V8 engine'],
            ['name' => 'Python', 'description' => 'High-level programming language'],
            ['name' => 'API', 'description' => 'Application Programming Interface'],
            ['name' => 'Database', 'description' => 'Structured collection of data'],
            ['name' => 'Frontend', 'description' => 'Client-side development'],
            ['name' => 'Backend', 'description' => 'Server-side development'],
            ['name' => 'Authentication', 'description' => 'User login and security'],
            ['name' => 'Debugging', 'description' => 'Finding and fixing code issues'],
            ['name' => 'Performance', 'description' => 'Optimization and speed'],
            ['name' => 'Security', 'description' => 'Protecting applications and data'],
            ['name' => 'Testing', 'description' => 'Code testing and quality assurance'],
            ['name' => 'Deployment', 'description' => 'Publishing applications to production'],
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(
                ['slug' => Str::slug($tag['name'])],
                [
                    'name' => $tag['name'],
                    'description' => $tag['description'],
                ]
            );
        }
    }
}
