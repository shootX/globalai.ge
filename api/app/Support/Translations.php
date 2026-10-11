<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;

final class Translations
{
    /**
     * Keep only ka/en/ru values and drop empty strings so Spatie can fall back to ka.
     *
     * @param  array<string, mixed>|null  $translations
     * @return array<string, mixed>
     */
    public static function strip(?array $translations): array
    {
        if ($translations === null) {
            return [];
        }

        $clean = [];

        foreach (Locales::ALL as $locale) {
            if (! array_key_exists($locale, $translations)) {
                continue;
            }

            $value = $translations[$locale];

            if (is_string($value)) {
                $value = trim($value);

                if ($value === '') {
                    continue;
                }
            }

            if ($value === null) {
                continue;
            }

            $clean[$locale] = $value;
        }

        return $clean;
    }

    /**
     * Expand a (possibly partial or empty) translation map to a full {ka, en, ru} object.
     *
     * @param  array<string, mixed>|null  $translations
     * @return array{ka: mixed, en: mixed, ru: mixed}
     */
    public static function fill(?array $translations): array
    {
        $clean = self::strip($translations);
        $full = [];

        foreach (Locales::ALL as $locale) {
            $full[$locale] = $clean[$locale] ?? null;
        }

        return $full;
    }

    /**
     * @param  array<string, mixed>|null  $translations
     */
    public static function sync(Model $model, string $attribute, ?array $translations): void
    {
        $model->replaceTranslations($attribute, self::strip($translations));
    }

    /**
     * @return array{ka: mixed, en: mixed, ru: mixed}
     */
    public static function map(Model $model, string $attribute): array
    {
        $stored = $model->getTranslations($attribute);

        return [
            'ka' => $stored['ka'] ?? null,
            'en' => $stored['en'] ?? null,
            'ru' => $stored['ru'] ?? null,
        ];
    }
}
