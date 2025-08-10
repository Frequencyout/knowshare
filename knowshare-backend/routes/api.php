<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\BadgeController;


Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Public list endpoints with search rate limiting
Route::middleware(['throttle:search'])->group(function () {
    Route::get('/questions', [QuestionController::class, 'index']);
    Route::get('/questions/{idOrSlug}', [QuestionController::class, 'show']);
    Route::get('/tags', [TagController::class, 'index']);
    Route::get('/tags/popular', [TagController::class, 'popular']);
    Route::get('/tags/{slug}', [TagController::class, 'show']);
    Route::get('/badges', [BadgeController::class, 'index']);
    Route::get('/badges/stats', [BadgeController::class, 'stats']);
    Route::get('/badges/type/{type}', [BadgeController::class, 'byType']);
    Route::get('/badges/{badge}', [BadgeController::class, 'show']);
});

// Stateless token-based auth endpoints with strict rate limiting
Route::middleware(['throttle:auth'])->group(function () {
    Route::post('/register', [ApiAuthController::class, 'register']);
    Route::post('/login', [ApiAuthController::class, 'login']);
});
Route::middleware('auth:sanctum')->post('/logout', [ApiAuthController::class, 'logout']);

// Authenticated content creation with specific rate limits
Route::middleware(['auth:sanctum'])->group(function () {
    // Account endpoints
    Route::get('/me', [AccountController::class, 'me']);
    Route::patch('/me', [AccountController::class, 'updateMe']);
    Route::get('/me/questions', [AccountController::class, 'myQuestions']);
    Route::get('/me/answers', [AccountController::class, 'myAnswers']);
    Route::get('/me/badges', [AccountController::class, 'myBadges']);
    Route::post('/me/avatar', [AccountController::class, 'uploadAvatar']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Reporting
    Route::post('/reports', [ReportController::class, 'store']);

    // Admin-only report management
    Route::get('/reports', [ReportController::class, 'index']);
    Route::patch('/reports/{report}', [ReportController::class, 'update']);
    Route::delete('/reports/{report}', [ReportController::class, 'destroy']);

    // Question management with rate limits
    Route::middleware(['throttle:questions'])->group(function () {
        Route::post('/questions', [QuestionController::class, 'store']);
        Route::patch('/questions/{question}', [QuestionController::class, 'update']);
        Route::delete('/questions/{question}', [QuestionController::class, 'destroy']);
        Route::patch('/questions/{question}/best', [QuestionController::class, 'setBestAnswer']);
    });

    // Answer management with rate limits
    Route::middleware(['throttle:answers'])->group(function () {
        Route::post('/questions/{questionId}/answers', [AnswerController::class, 'store']);
        Route::patch('/answers/{answer}', [AnswerController::class, 'update']);
        Route::delete('/answers/{answer}', [AnswerController::class, 'destroy']);
    });

    // Voting with rate limits
    Route::middleware(['throttle:voting'])->group(function () {
        Route::post('/questions/{question}/vote', [QuestionController::class, 'vote']);
        Route::post('/answers/{answer}/vote', [AnswerController::class, 'vote']);
    });
});
