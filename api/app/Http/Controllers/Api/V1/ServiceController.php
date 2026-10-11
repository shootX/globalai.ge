<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceDetailResource;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Support\Locales;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $locale = Locales::fromRequest($request);

        $services = Service::query()
            ->published()
            ->ordered()
            ->get()
            ->each(fn (Service $service) => $service->setLocale($locale));

        return ServiceResource::collection($services)->additional([
            'meta' => ['total' => $services->count()],
        ]);
    }

    public function show(Request $request, string $slug): ServiceDetailResource
    {
        $locale = Locales::fromRequest($request);

        $service = Service::query()
            ->published()
            ->where('slug->'.$locale, $slug)
            ->firstOrFail();

        $service->setLocale($locale);

        return new ServiceDetailResource($service);
    }
}
