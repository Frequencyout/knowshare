<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
// remove duplicate function imports if any were added elsewhere
use function response;
use function abort;

class AnswerController extends Controller
{
    public function store($questionId, \Illuminate\Http\Request $request)
    {
        $question = Question::findOrFail($questionId);
        $validated = $request->validate([
            'body_markdown' => ['required', 'string'],
        ]);

        $answer = Answer::create([
            'question_id' => $question->id,
            'user_id' => $request->user()->id,
            'body_markdown' => $validated['body_markdown'],
            'body_html' => null,
            'score' => 0,
            'is_accepted' => false,
        ]);

        return response()->json($answer, 201);
    }

    public function update(\Illuminate\Http\Request $request, Answer $answer)
    {
        if ((int) $request->user()->id !== (int) $answer->user_id) {
            abort(403);
        }
        $validated = $request->validate([
            'body_markdown' => ['required', 'string'],
        ]);
        $answer->update($validated);
        return response()->json($answer);
    }

    public function destroy(\Illuminate\Http\Request $request, Answer $answer)
    {
        if ((int) $request->user()->id !== (int) $answer->user_id) {
            abort(403);
        }
        $answer->delete();
        return response()->noContent();
    }

    public function vote(Answer $answer, \Illuminate\Http\Request $request)
    {
        $data = $request->validate([
            'action' => ['required', 'in:up,down,remove'],
        ]);

        $user = $request->user();

        switch ($data['action']) {
            case 'up':
                $user->upvote($answer);
                break;
            case 'down':
                $user->downvote($answer);
                break;
            case 'remove':
                $user->cancelVote($answer);
                break;
        }

        $score = (int) DB::table('votes')
            ->where('votable_type', Answer::class)
            ->where('votable_id', $answer->id)
            ->sum('value');

        $answer->score = $score;
        $answer->save();

        $myVote = $user->hasUpvoted($answer) ? 1 : ($user->hasDownvoted($answer) ? -1 : 0);

        return response()->json([
            'score' => $score,
            'my_vote' => $myVote,
        ]);
    }
}


