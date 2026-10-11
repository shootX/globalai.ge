<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Concerns\DispatchesRevalidation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertServiceRequest;
use App\Http\Resources\Admin\ServiceResource;
use App\Models\Service;
use App\Support\TranslationWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ServiceController extends Controller
{
    use DispatchesRevalidation;

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Service::class);

        $services = Service::query()->ordered()->get();

        return ServiceResource::collection($services)->additional([
            'meta' => ['total' => $services->count()],
        ]);
    }

    public function store(UpsertServiceRequest $request): JsonResponse
    {
        $this->authorize('create', Service::class);

        $service = new Service;
        $this->fill($service, $request->validated());
        $service->save();
        $this->revalidate('services');

        return (new ServiceResource($service))->response()->setStatusCode(201);
    }

    public function show(Service $service): ServiceResource
    {
        $this->authorize('view', $service);

        return new ServiceResource($service);
    }

    public function update(UpsertServiceRequest $request, Service $service): ServiceResource
    {
        $this->authorize('update', $service);

        $this->fill($service, $request->validated());
        $service->save();
        $this->revalidate('services');

        return new ServiceResource($service);
    }

    public function destroy(Service $service): Response
    {
        $this->authorize('delete', $service);

        $service->delete();
        $this->revalidate('services');

        return response()->noContent();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function fill(Service $service, array $data): void
    {
        TranslationWriter::apply($service, $data, [
            'slug', 'title', 'summary', 'body', 'seo_title', 'seo_description',
        ]);

        foreach (['og_image', 'noindex', 'sort_order', 'is_published'] as $field) {
            if (array_key_exists($field, $data)) {
                $service->{$field} = $field === 'og_image' && $data[$field] === '' ? null : $data[$field];
            }
        }
    }
}
