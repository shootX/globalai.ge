<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Concerns\DispatchesRevalidation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertPageRequest;
use App\Http\Resources\Admin\PageResource;
use App\Models\Page;
use App\Support\TranslationWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class PageController extends Controller
{
    use DispatchesRevalidation;

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Page::class);

        $pages = Page::query()->orderBy('id')->get();

        return PageResource::collection($pages)->additional([
            'meta' => ['total' => $pages->count()],
        ]);
    }

    public function store(UpsertPageRequest $request): JsonResponse
    {
        $this->authorize('create', Page::class);

        $page = new Page;
        $page->key = $request->validated('key');
        $this->fill($page, $request->validated());
        $page->save();
        $this->revalidate('pages');

        return (new PageResource($page))->response()->setStatusCode(201);
    }

    public function show(Page $page): PageResource
    {
        $this->authorize('view', $page);

        return new PageResource($page);
    }

    public function update(UpsertPageRequest $request, Page $page): PageResource
    {
        $this->authorize('update', $page);

        if ($request->exists('key')) {
            $page->key = $request->validated('key');
        }

        $this->fill($page, $request->validated());
        $page->save();
        $this->revalidate('pages');

        return new PageResource($page);
    }

    public function destroy(Page $page): Response
    {
        $this->authorize('delete', $page);

        $page->delete();
        $this->revalidate('pages');

        return response()->noContent();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function fill(Page $page, array $data): void
    {
        TranslationWriter::apply($page, $data, ['content', 'seo_title', 'seo_description']);

        if (array_key_exists('og_image', $data)) {
            $page->og_image = $data['og_image'] === '' ? null : $data['og_image'];
        }

        if (array_key_exists('noindex', $data)) {
            $page->noindex = (bool) $data['noindex'];
        }
    }
}
