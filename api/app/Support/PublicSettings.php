<?php

namespace App\Support;

use App\Models\Setting;

final class PublicSettings
{
    /**
     * @return array<string, mixed>
     */
    public function resolve(string $locale): array
    {
        $stored = Setting::query()
            ->whereIn('key', Setting::KEYS)
            ->get()
            ->keyBy('key');

        $value = fn (string $key, mixed $default = null): mixed => $stored->has($key)
            ? $stored->get($key)->value
            : $default;

        $statsVisible = filter_var($value('stats_visible', false), FILTER_VALIDATE_BOOLEAN);

        return [
            'contact_email' => $value('contact_email'),
            'contact_phone' => $value('contact_phone'),
            'contact_address' => $this->translate($value('contact_address'), $locale),
            'socials' => $value('socials', []) ?? [],
            'logo' => $value('logo'),
            'stats' => $statsVisible ? $this->stats($value('stats', []), $locale) : [],
            'projects_nav_visible' => filter_var($value('projects_nav_visible', false), FILTER_VALIDATE_BOOLEAN),
            'team_visible' => filter_var($value('team_visible', false), FILTER_VALIDATE_BOOLEAN),
            'stats_visible' => $statsVisible,
        ];
    }

    private function translate(mixed $value, string $locale): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        // An empty translation map (legacy `[]`) means "not set".
        if ($value === []) {
            return null;
        }

        if (array_is_list($value)) {
            return $value;
        }

        $keys = array_keys($value);
        $onlyLocales = $keys !== [] && count(array_diff($keys, Locales::ALL)) === 0;

        if (! $onlyLocales) {
            return $value;
        }

        $resolved = $value[$locale] ?? null;

        if ($resolved === null || $resolved === '') {
            $resolved = $value[Locales::PRIMARY] ?? null;
        }

        return $resolved === '' ? null : $resolved;
    }

    /**
     * @return array<int, array{value: mixed, label: mixed}>
     */
    private function stats(mixed $stats, string $locale): array
    {
        if (! is_array($stats)) {
            return [];
        }

        return array_values(array_map(function (mixed $stat) use ($locale): array {
            $row = is_array($stat) ? $stat : [];

            return [
                'value' => $row['value'] ?? null,
                'label' => $this->translate($row['label'] ?? null, $locale),
            ];
        }, $stats));
    }
}
