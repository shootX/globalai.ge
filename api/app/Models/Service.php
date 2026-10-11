<?php

namespace App\Models;

use App\Models\Concerns\HasPublishing;
use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

#[Fillable(['slug', 'title', 'summary', 'body', 'seo_title', 'seo_description', 'sort_order', 'is_published'])]
class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory, HasPublishing, HasTranslations;

    /** @var array<int, string> */
    public array $translatable = [
        'slug',
        'title',
        'summary',
        'body',
        'seo_title',
        'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
