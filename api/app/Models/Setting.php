<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'value'])]
class Setting extends Model
{
    public const KEYS = [
        'contact_email',
        'contact_phone',
        'contact_address',
        'socials',
        'logo',
        'stats',
        'projects_nav_visible',
        'team_visible',
        'stats_visible',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'json',
        ];
    }

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::query()->where('key', $key)->first();

        if ($setting === null) {
            return $default;
        }

        return $setting->value;
    }

    public static function putValue(string $key, mixed $value): void
    {
        static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value],
        );
    }

    public static function flag(string $key): bool
    {
        return filter_var(static::getValue($key, false), FILTER_VALIDATE_BOOLEAN);
    }
}
