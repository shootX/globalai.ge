<?php

namespace App\Support;

use Illuminate\Validation\Rule;

final class TranslatableRules
{
    public const SLUG = '/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u';

    /**
     * @return array<string, mixed>
     */
    public static function text(string $field, bool $required = true, int $max = 5000): array
    {
        return [
            $field => [$required ? 'required' : 'sometimes', 'array'],
            "{$field}.ka" => [$required ? 'required' : 'nullable', 'string', 'max:'.$max],
            "{$field}.en" => ['nullable', 'string', 'max:'.$max],
            "{$field}.ru" => ['nullable', 'string', 'max:'.$max],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function slug(string $table, ?int $ignoreId = null): array
    {
        $slug = ['nullable', 'string', 'max:255', 'regex:'.self::SLUG];

        return [
            'slug' => ['required', 'array'],
            'slug.ka' => ['required', 'string', 'max:255', 'regex:'.self::SLUG, Rule::unique($table, 'slug->ka')->ignore($ignoreId)],
            'slug.en' => [...$slug, Rule::unique($table, 'slug->en')->ignore($ignoreId)],
            'slug.ru' => [...$slug, Rule::unique($table, 'slug->ru')->ignore($ignoreId)],
        ];
    }
}
