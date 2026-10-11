<?php

namespace App\Http\Resources\Concerns;

use App\Support\Translations;

trait ReadsTranslations
{
    protected function translated(string $attribute): mixed
    {
        $value = $this->resource->getAttribute($attribute);

        return $value === '' ? null : $value;
    }

    /**
     * @return array{ka: ?string, en: ?string, ru: ?string}
     */
    protected function slugAlternates(): array
    {
        $slugs = $this->resource->getTranslations('slug');

        return [
            'ka' => $slugs['ka'] ?? null,
            'en' => $slugs['en'] ?? null,
            'ru' => $slugs['ru'] ?? null,
        ];
    }

    /**
     * @return array{ka: mixed, en: mixed, ru: mixed}
     */
    protected function translationMap(string $attribute): array
    {
        return Translations::map($this->resource, $attribute);
    }
}
