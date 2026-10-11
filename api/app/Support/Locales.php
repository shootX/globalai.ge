<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

final class Locales
{
    public const ALL = ['ka', 'en', 'ru'];

    public const PRIMARY = 'ka';

    public static function fromRequest(Request $request): string
    {
        $locale = $request->query('locale', self::PRIMARY);

        if (! is_string($locale) || ! in_array($locale, self::ALL, true)) {
            throw ValidationException::withMessages([
                'locale' => [__('validation.in', ['attribute' => 'locale'])],
            ]);
        }

        app()->setLocale($locale);

        return $locale;
    }
}
