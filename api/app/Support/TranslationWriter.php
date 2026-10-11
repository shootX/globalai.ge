<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;

final class TranslationWriter
{
    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, string>  $attributes
     */
    public static function apply(Model $model, array $data, array $attributes): void
    {
        foreach ($attributes as $attribute) {
            if (array_key_exists($attribute, $data)) {
                Translations::sync($model, $attribute, is_array($data[$attribute]) ? $data[$attribute] : []);
            }
        }
    }
}
