<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Question;
use App\Models\Answer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reportable_type' => ['required', 'in:question,answer,user'],
            'reportable_id' => ['required', 'integer'],
            'reason' => ['required', 'in:spam,harassment,inappropriate,copyright,other'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        // Map reportable_type to actual model class
        $typeMap = [
            'question' => Question::class,
            'answer' => Answer::class,
            'user' => User::class,
        ];

        $reportableType = $typeMap[$validated['reportable_type']];

        // Check if the reportable entity exists
        $reportable = $reportableType::find($validated['reportable_id']);
        if (!$reportable) {
            return response()->json(['message' => 'Entity not found'], 404);
        }

        // Check if user already reported this entity
        $existingReport = Report::where([
            'user_id' => $request->user()->id,
            'reportable_type' => $reportableType,
            'reportable_id' => $validated['reportable_id'],
        ])->first();

        if ($existingReport) {
            return response()->json(['message' => 'You have already reported this content'], 422);
        }

        $report = Report::create([
            'user_id' => $request->user()->id,
            'reportable_type' => $reportableType,
            'reportable_id' => $validated['reportable_id'],
            'reason' => $validated['reason'],
            'description' => $validated['description'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Report submitted successfully',
            'report_id' => $report->id,
        ], 201);
    }

    // Admin endpoints
    public function index(Request $request)
    {
        // Only allow admins to view reports
        if (!$request->user()->is_admin) {
            abort(403, 'Admin access required');
        }

        $status = $request->query('status', 'pending');

        $query = Report::with(['user', 'reviewer', 'reportable'])
            ->when($status !== 'all', fn($q) => $q->where('status', $status))
            ->orderByDesc('created_at');

        return $query->paginate(20);
    }

    public function update(Request $request, Report $report)
    {
        // Only allow admins to update reports
        if (!$request->user()->is_admin) {
            abort(403, 'Admin access required');
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,reviewed,resolved,dismissed'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $report->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Report updated successfully',
            'report' => $report->load(['user', 'reviewer', 'reportable']),
        ]);
    }

    public function destroy(Request $request, Report $report)
    {
        // Only allow admins to delete reports
        if (!$request->user()->is_admin) {
            abort(403, 'Admin access required');
        }

        $report->delete();

        return response()->json(['message' => 'Report deleted successfully']);
    }
}
