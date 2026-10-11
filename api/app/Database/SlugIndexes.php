<?php

namespace App\Database;

use Illuminate\Support\Facades\DB;

final class SlugIndexes
{
    public static function create(string $table): void
    {
        foreach (['ka', 'en', 'ru'] as $locale) {
            DB::statement(
                "CREATE UNIQUE INDEX {$table}_slug_{$locale}_unique ON {$table} ((slug->>'{$locale}')) WHERE (slug->>'{$locale}') IS NOT NULL AND (slug->>'{$locale}') <> ''"
            );
        }
    }
}
