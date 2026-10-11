<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectDetailResource;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Support\Locales;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjectController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $locale = Locales::fromRequest($request);

        $projects = Project::query()
            ->published()
            ->ordered()
            ->get()
            ->each(fn (Project $project) => $project->setLocale($locale));

        return ProjectResource::collection($projects)->additional([
            'meta' => ['total' => $projects->count()],
        ]);
    }

    public function show(Request $request, string $slug): ProjectDetailResource
    {
        $locale = Locales::fromRequest($request);

        $project = Project::query()
            ->published()
            ->where('slug->'.$locale, $slug)
            ->firstOrFail();

        $project->setLocale($locale);

        return new ProjectDetailResource($project);
    }
}
