<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AuditLogIndexRequest;
use App\Http\Resources\Admin\AuditLogResource;
use App\Models\AuditLog;
use App\Models\ContactSubmission;
use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Laravel\Sanctum\PersonalAccessToken;

class AuditLogController extends Controller
{
    public function rejectWrite(): JsonResponse
    {
        return response()->json(['message' => 'Audit log is append-only.'], 405);
    }

    public function index(AuditLogIndexRequest $request): AnonymousResourceCollection
    {
        $logs = AuditLog::query()
            ->with('user')
            ->when($request->filled('user_id'), fn ($query) => $query->where('user_id', $request->integer('user_id')))
            ->when($request->filled('model_type'), function ($query) use ($request) {
                $query->whereIn('model_type', $this->types($request->string('model_type')->toString()));
            })
            ->when($request->filled('from'), fn ($query) => $query->where('created_at', '>=', $request->date('from')->startOfDay()))
            ->when($request->filled('to'), fn ($query) => $query->where('created_at', '<=', $request->date('to')->endOfDay()))
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return AuditLogResource::collection($logs);
    }

    /**
     * @return array<int, string|null>
     */
    private function types(string $filter): array
    {
        $map = [
            'service' => Service::class,
            'services' => Service::class,
            'project' => Project::class,
            'projects' => Project::class,
            'page' => Page::class,
            'pages' => Page::class,
            'team' => TeamMember::class,
            'teammember' => TeamMember::class,
            'setting' => Setting::class,
            'settings' => Setting::class,
            'submission' => ContactSubmission::class,
            'submissions' => ContactSubmission::class,
            'contactsubmission' => ContactSubmission::class,
            'user' => User::class,
            'users' => User::class,
            'token' => PersonalAccessToken::class,
            'personalaccesstoken' => PersonalAccessToken::class,
            'upload' => 'upload',
        ];

        $key = strtolower(class_basename($filter));

        if (isset($map[$key])) {
            return [$map[$key], $filter];
        }

        return [$filter];
    }
}
