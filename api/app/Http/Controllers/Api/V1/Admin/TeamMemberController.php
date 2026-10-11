<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Concerns\DispatchesRevalidation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertTeamMemberRequest;
use App\Http\Resources\Admin\TeamMemberResource;
use App\Models\TeamMember;
use App\Support\TranslationWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TeamMemberController extends Controller
{
    use DispatchesRevalidation;

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TeamMember::class);

        $members = TeamMember::query()->ordered()->get();

        return TeamMemberResource::collection($members)->additional([
            'meta' => ['total' => $members->count()],
        ]);
    }

    public function store(UpsertTeamMemberRequest $request): JsonResponse
    {
        $this->authorize('create', TeamMember::class);

        $member = new TeamMember;
        $this->fill($member, $request->validated());
        $member->save();
        $this->revalidate('team');

        return (new TeamMemberResource($member))->response()->setStatusCode(201);
    }

    public function show(TeamMember $teamMember): TeamMemberResource
    {
        $this->authorize('view', $teamMember);

        return new TeamMemberResource($teamMember);
    }

    public function update(UpsertTeamMemberRequest $request, TeamMember $teamMember): TeamMemberResource
    {
        $this->authorize('update', $teamMember);

        $this->fill($teamMember, $request->validated());
        $teamMember->save();
        $this->revalidate('team');

        return new TeamMemberResource($teamMember);
    }

    public function destroy(TeamMember $teamMember): Response
    {
        $this->authorize('delete', $teamMember);

        $teamMember->delete();
        $this->revalidate('team');

        return response()->noContent();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function fill(TeamMember $member, array $data): void
    {
        TranslationWriter::apply($member, $data, ['name', 'role', 'bio']);

        foreach (['photo', 'sort_order', 'is_published'] as $field) {
            if (array_key_exists($field, $data)) {
                $member->{$field} = $data[$field];
            }
        }
    }
}
