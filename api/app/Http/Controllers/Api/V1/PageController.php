<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;
use App\Support\Locales;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function show(Request $request, string $key): PageResource
    {
        $locale = Locales::fromRequest($request);

        $page = Page::query()->where('key', $key)->firstOrFail();
        $page->setLocale($locale);

        return new PageResource($page);
    }
}
