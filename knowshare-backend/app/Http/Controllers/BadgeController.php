<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use Illuminate\Http\Request;

class BadgeController extends Controller
{
    /**
     * Get all available badges
     */
    public function index()
    {
        $badges = Badge::active()
            ->orderBy('type', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($badges);
    }

    /**
     * Get a specific badge
     */
    public function show(Badge $badge)
    {
        return response()->json($badge);
    }

    /**
     * Get badges by type
     */
    public function byType($type)
    {
        $badges = Badge::active()
            ->where('type', $type)
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($badges);
    }

    /**
     * Get badge statistics
     */
    public function stats()
    {
        $stats = [
            'total_badges' => Badge::active()->count(),
            'bronze_badges' => Badge::active()->where('type', 'bronze')->count(),
            'silver_badges' => Badge::active()->where('type', 'silver')->count(),
            'gold_badges' => Badge::active()->where('type', 'gold')->count(),
        ];

        return response()->json($stats);
    }
}
