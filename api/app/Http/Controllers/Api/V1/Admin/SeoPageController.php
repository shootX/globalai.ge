<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Concerns\DispatchesRevalidation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSeoPageRequest;
use App\Http\Resources\Admin\PageResource;
use App\Models\Page;
use App\Support\TranslationWriter;
use Illuminate\Http\JsonResponse;

class SeoPageController extends Controller
{
    use DispatchesRevalidation;

    public function show(string $key): JsonResponse
    {
        $page = $this->page($key);
        $this->authorize('view', $page);

        return response()->json(['data' => $this->payload($page)]);
    }

    public function update(UpdateSeoPageRequest $request, string $key): JsonResponse
    {
        $page = $this->page($key);
        $this->authorize('update', $page);

        $data = $request->validated();
        TranslationWriter::apply($page, $data, ['seo_title', 'seo_description']);

        if (array_key_exists('og_image', $data)) {
            $page->og_image = $data['og_image'] === '' ? null : $data['og_image'];
        }

        if (array_key_exists('noindex', $data)) {
            $page->noindex = (bool) $data['noindex'];
        }

        $page->save();
        $this->revalidate('pages');

        return response()->json(['data' => $this->payload($page)]);
    }

    private function page(string $key): Page
    {
        abort_unless(in_array($key, Page::KEYS, true), 404);

        return Page::query()->where('key', $key)->firstOrFail();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Page $page): array
    {
        $resource = (new PageResource($page))->resolve();

        return [
            'key' => $page->key,
            'seo_title' => $resource['seo_title'],
            'seo_description' => $resource['seo_description'],
            'og_image' => $page->og_image,
            'noindex' => (bool) $page->noindex,
        ];
    }
}
