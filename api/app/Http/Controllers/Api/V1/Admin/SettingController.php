<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Concerns\DispatchesRevalidation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Setting;
use App\Support\Translations;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    use DispatchesRevalidation;

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Setting::class);

        return response()->json(['data' => $this->payload()]);
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $this->authorize('updateAny', Setting::class);

        foreach ($request->validated() as $key => $value) {
            Setting::putValue($key, $this->normalize($key, $value));
        }

        $this->revalidate('settings');

        return response()->json(['data' => $this->payload()]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(): array
    {
        $stored = Setting::query()->whereIn('key', Setting::KEYS)->get()->keyBy('key');
        $data = [];

        foreach (Setting::KEYS as $key) {
            $data[$key] = $this->present($key, $stored->has($key) ? $stored->get($key)->value : null);
        }

        return $data;
    }

    /**
     * Shape stored values for admin responses: translatable values always come back as a full
     * {ka, en, ru} object (missing locales are null) instead of a stripped map or an empty `[]`.
     */
    private function present(string $key, mixed $value): mixed
    {
        if ($key === 'contact_address') {
            return Translations::fill(is_array($value) ? $value : null);
        }

        if ($key === 'stats') {
            return array_values(array_map(function (mixed $stat): array {
                $row = is_array($stat) ? $stat : [];
                $row['label'] = Translations::fill(is_array($row['label'] ?? null) ? $row['label'] : null);

                return $row;
            }, is_array($value) ? $value : []));
        }

        return $value;
    }

    private function normalize(string $key, mixed $value): mixed
    {
        if ($key === 'contact_address' && is_array($value)) {
            $clean = Translations::strip($value);

            // Store "no address" as null rather than an empty JSON array.
            return $clean === [] ? null : $clean;
        }

        if ($key === 'stats' && is_array($value)) {
            return array_map(function (mixed $stat): array {
                $row = is_array($stat) ? $stat : [];
                $row['label'] = Translations::strip(is_array($row['label'] ?? null) ? $row['label'] : []);

                return $row;
            }, $value);
        }

        return $value;
    }
}
