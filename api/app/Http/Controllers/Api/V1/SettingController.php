<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\Locales;
use App\Support\PublicSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(Request $request, PublicSettings $settings): JsonResponse
    {
        $locale = Locales::fromRequest($request);

        return response()->json([
            'data' => $settings->resolve($locale),
        ]);
    }
}
