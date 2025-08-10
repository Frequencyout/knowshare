<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Tag;
use App\Notifications\AnswerAcceptedNotification;
use App\Services\MarkdownService;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $tagParam = trim((string) $request->query('tag', ''));
        $sort = $request->query('sort', 'new');

        $query = Question::query()
            ->with(['user', 'tags'])
            ->withCount('answers');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                  ->orWhere('body_html', 'like', "%$search%")
                  ->orWhere('body_markdown', 'like', "%$search%");
            });
        }

        if ($tagParam !== '') {
            $slugs = \collect(explode(',', $tagParam))
                ->map(fn ($s) => trim($s))
                ->filter()
                ->unique()
                ->values();
            if ($slugs->isNotEmpty()) {
                $query->whereHas('tags', function ($q) use ($slugs) {
                    $q->whereIn('slug', $slugs->all());
                });
            }
        }

        if ($sort === 'top') {
            $query->orderByDesc('score');
        } elseif ($sort === 'unanswered') {
            $query->whereNull('accepted_answer_id')
                  ->has('answers', '=', 0)
                  ->orderByDesc('created_at');
        } else {
            $query->orderByDesc('created_at');
        }

        return $query->paginate(20);
    }

    public function store(Request $request, MarkdownService $markdownService, BadgeService $badgeService)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body_markdown' => ['required', 'string'],
            'tags' => ['array'],
            'tags.*' => ['string'],
        ]);

        $slug = Str::slug($validated['title']) . '-' . Str::random(6);

        $question = Question::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'body_markdown' => $validated['body_markdown'],
            'body_html' => $markdownService->toSafeHtml($validated['body_markdown']),
            'slug' => $slug,
            'score' => 0,
            'views' => 0,
            'accepted_answer_id' => null,
            'is_closed' => false,
        ]);

        $tags = \collect($validated['tags'] ?? [])
            ->map(fn ($slug) => trim($slug))
            ->filter()
            ->unique()
            ->values();

        if ($tags->isEmpty()) {
            // Auto-tag suggestion fallback based on title/body
            $haystack = Str::lower(($validated['title'] ?? '') . ' ' . ($validated['body_markdown'] ?? ''));
            $allTags = Tag::query()->select(['id','slug','name'])->get();
            $matched = $allTags->filter(function ($t) use ($haystack) {
                $slug = Str::lower($t->slug);
                $name = Str::lower($t->name);
                return Str::contains($haystack, $slug) || Str::contains($haystack, $name);
            })->take(5)->pluck('id');
            if ($matched->isNotEmpty()) {
                $question->tags()->sync($matched);
            }
        } else {
            $tagIds = Tag::query()->whereIn('slug', $tags)->pluck('id');
            if ($tagIds->isNotEmpty()) {
                $question->tags()->sync($tagIds);
            }
        }

        // Check for new badges
        $badgeService->checkAndAwardBadges($request->user());

        return \response()->json($question->load('tags'));
    }

    public function show($idOrSlug)
    {
        $question = Question::query()
            ->with(['user', 'tags', 'answers' => function ($q) {
                $q->with('user')->orderByDesc('score')->orderBy('created_at');
            }])
            ->when(is_numeric($idOrSlug), fn ($q) => $q->where('id', $idOrSlug), fn ($q) => $q->where('slug', $idOrSlug))
            ->firstOrFail();

        return $question;
    }

    public function update(Request $request, Question $question, MarkdownService $markdownService)
    {
        if ($request->user()->id !== $question->user_id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'body_markdown' => ['sometimes', 'string'],
        ]);

        // If body_markdown is updated, regenerate body_html
        if (isset($validated['body_markdown'])) {
            $validated['body_html'] = $markdownService->toSafeHtml($validated['body_markdown']);
        }

        $question->fill($validated)->save();

        return \response()->json($question->fresh('tags'));
    }

    public function destroy(Question $question)
    {
        if (request()->user()->id !== $question->user_id) {
            abort(403);
        }
        $question->delete();
        return \response()->noContent();
    }

    public function setBestAnswer(Request $request, Question $question, BadgeService $badgeService)
    {
        if ($request->user()->id !== $question->user_id) {
            abort(403);
        }
        $validated = $request->validate([
            'answer_id' => ['required', 'integer'],
        ]);

        $answer = Answer::findOrFail($validated['answer_id']);

        // Ensure the answer belongs to this question
        if ($answer->question_id !== $question->id) {
            abort(400, 'Answer does not belong to this question');
        }

        $question->accepted_answer_id = $validated['answer_id'];
        $question->save();

        // Update the answer's accepted status
        Answer::where('question_id', $question->id)->update(['is_accepted' => false]);
        $answer->update(['is_accepted' => true]);

                // Send notification to answer author (but not if they accepted their own answer)
        if ($answer->user_id !== $request->user()->id) {
            $answer->user->notify(new AnswerAcceptedNotification($answer, $question, $request->user()));
        }

        // Check for new badges for the answer author (they got their answer accepted)
        $badgeService->checkAndAwardBadges($answer->user);

        return \response()->json(['accepted_answer_id' => $question->accepted_answer_id]);
    }

    public function vote(Question $question, Request $request)
    {
        $data = $request->validate([
            'action' => ['required', 'in:up,down,remove'],
        ]);

        $user = $request->user();

        switch ($data['action']) {
            case 'up':
                $user->upvote($question);
                break;
            case 'down':
                $user->downvote($question);
                break;
            case 'remove':
                $user->cancelVote($question);
                break;
        }

        $score = (int) DB::table('votes')
            ->where('votable_type', Question::class)
            ->where('votable_id', $question->id)
            ->sum('votes');

        $question->score = $score;
        $question->save();

        $myVote = $user->hasUpvoted($question) ? 1 : ($user->hasDownvoted($question) ? -1 : 0);

        return \response()->json([
            'score' => $score,
            'my_vote' => $myVote,
        ]);
    }
}


