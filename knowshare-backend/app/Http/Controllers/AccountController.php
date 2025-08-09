<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AccountController extends Controller
{
    public function me(Request $request)
    {
        return $request->user()->only(['id','name','email','avatar_url','bio','reputation']);
    }

    public function updateMe(Request $request)
    {
        $data = $request->validate([
            'name' => ['sometimes','string','max:255'],
            'avatar_url' => ['sometimes','nullable','string','max:2048'],
            'bio' => ['sometimes','nullable','string','max:5000'],
        ]);
        $user = $request->user();
        $user->fill($data)->save();
        return $user->only(['id','name','email','avatar_url','bio','reputation']);
    }

    public function myQuestions(Request $request)
    {
        return $request->user()->questions()->with(['tags'])->withCount('answers')->latest()->paginate(20);
    }

    public function myAnswers(Request $request)
    {
        return $request->user()->answers()->with(['question'])->latest()->paginate(20);
    }

    // Public profile
    public function showUser($id)
    {
        $user = User::query()->findOrFail($id);
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar_url' => $user->avatar_url,
            'bio' => $user->bio,
            'reputation' => $user->reputation,
        ];
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required','image','mimes:jpeg,jpg,png,gif,webp','max:2048'],
        ]);

        $user = $request->user();

        $path = $request->file('avatar')->store('avatars', 'public');

        // Optionally delete old avatar if stored in our disk
        // if ($user->avatar_url && str_starts_with($user->avatar_url, asset('storage'))) { }

        $user->avatar_url = asset('storage/'.$path);
        $user->save();

        return [ 'avatar_url' => $user->avatar_url ];
    }
}


