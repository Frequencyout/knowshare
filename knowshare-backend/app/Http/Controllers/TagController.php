<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $query = Tag::query()->withCount('questions');
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('slug', 'like', "%$search%");
            });
        }

        return $query->orderByDesc('questions_count')->orderBy('name')->paginate(20);
    }

    public function show($slug)
    {
        $tag = Tag::query()->where('slug', $slug)->withCount('questions')->firstOrFail();

        $questions = $tag->questions()
            ->with(['user', 'tags'])
            ->withCount('answers')
            ->orderByDesc('score')
            ->orderByDesc('created_at')
            ->paginate(20);

        return [
            'tag' => $tag,
            'questions' => $questions
        ];
    }

    public function popular()
    {
        return Tag::query()
            ->withCount('questions')
            ->having('questions_count', '>', 0)
            ->orderByDesc('questions_count')
            ->limit(20)
            ->get();
    }
}


