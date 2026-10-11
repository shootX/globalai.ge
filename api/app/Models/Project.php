<?php

namespace App\Models;

use App\Models\Concerns\HasPublishing;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

#[Fillable(['slug', 'title', 'summary', 'body', 'category', 'cover_image', 'gallery', 'seo_title', 'seo_description', 'sort_order', 'is_published'])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory, HasPublishing, HasTranslations;

    /** @var array<int, string> */
    public array $translatable = [
        'slug',
        'title',
        'summary',
        'body',
        'category',
        'seo_title',
        'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
