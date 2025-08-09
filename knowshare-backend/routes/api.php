<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\AccountController;


Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Public list endpoints
Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/questions/{idOrSlug}', [QuestionController::class, 'show']);
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/popular', [TagController::class, 'popular']);
Route::get('/tags/{slug}', [TagController::class, 'show']);

// Stateless token-based auth endpoints under /api
Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/login', [ApiAuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [ApiAuthController::class, 'logout']);

// Authenticated content creation
Route::middleware(['auth:sanctum'])->group(function () {
    // Account
    Route::get('/me', [AccountController::class, 'me']);
    Route::patch('/me', [AccountController::class, 'updateMe']);
    Route::get('/me/questions', [AccountController::class, 'myQuestions']);
    Route::get('/me/answers', [AccountController::class, 'myAnswers']);
    Route::post('/me/avatar', [AccountController::class, 'uploadAvatar']);
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::patch('/questions/{question}', [QuestionController::class, 'update']);
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy']);
    Route::patch('/questions/{question}/best', [QuestionController::class, 'setBestAnswer']);

    Route::post('/questions/{question}/vote', [QuestionController::class, 'vote']);

    Route::post('/questions/{questionId}/answers', [AnswerController::class, 'store']);
    Route::patch('/answers/{answer}', [AnswerController::class, 'update']);
    Route::delete('/answers/{answer}', [AnswerController::class, 'destroy']);
    Route::post('/answers/{answer}/vote', [AnswerController::class, 'vote']);
});
