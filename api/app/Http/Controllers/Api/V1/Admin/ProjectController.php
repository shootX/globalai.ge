<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Concerns\DispatchesRevalidation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertProjectRequest;
use App\Http\Resources\Admin\ProjectResource;
use App\Models\Project;
use App\Support\TranslationWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    use DispatchesRevalidation;

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Project::class);

        $projects = Project::query()->ordered()->get();

        return ProjectResource::collection($projects)->additional([
            'meta' => ['total' => $projects->count()],
        ]);
    }

    public function store(UpsertProjectRequest $request): JsonResponse
    {
        $this->authorize('create', Project::class);

        $project = new Project;
        $this->fill($project, $request->validated());
        $project->save();
        $this->revalidate('projects');

        return (new ProjectResource($project))->response()->setStatusCode(201);
    }

    public function show(Project $project): ProjectResource
    {
        $this->authorize('view', $project);

        return new ProjectResource($project);
    }

    public function update(UpsertProjectRequest $request, Project $project): ProjectResource
    {
        $this->authorize('update', $project);

        $this->fill($project, $request->validated());
        $project->save();
        $this->revalidate('projects');

        return new ProjectResource($project);
    }

    public function destroy(Project $project): Response
    {
        $this->authorize('delete', $project);

        $project->delete();
        $this->revalidate('projects');

        return response()->noContent();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function fill(Project $project, array $data): void
    {
        TranslationWriter::apply($project, $data, [
            'slug', 'title', 'summary', 'body', 'category', 'seo_title', 'seo_description',
        ]);

        foreach (['cover_image', 'gallery', 'sort_order', 'is_published'] as $field) {
            if (array_key_exists($field, $data)) {
                $project->{$field} = $data[$field];
            }
        }
    }
}
