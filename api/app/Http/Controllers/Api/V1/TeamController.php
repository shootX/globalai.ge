<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamMemberResource;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Support\Locales;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TeamController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection|JsonResponse
    {
        $locale = Locales::fromRequest($request);

        if (! Setting::flag('team_visible')) {
            return response()->json([
                'data' => [],
                'meta' => ['total' => 0],
            ]);
        }

        $members = TeamMember::query()
            ->published()
            ->ordered()
            ->get()
            ->each(fn (TeamMember $member) => $member->setLocale($locale));

        return TeamMemberResource::collection($members)->additional([
            'meta' => ['total' => $members->count()],
        ]);
    }
}
