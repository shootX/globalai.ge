<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

#[Fillable(['key', 'content', 'seo_title', 'seo_description', 'og_image', 'noindex'])]
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use Auditable, HasFactory, HasTranslations;

    public const KEYS = ['home', 'about', 'services', 'projects', 'contact'];

    /** @var array<int, string> */
    public array $translatable = [
        'content',
        'seo_title',
        'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'noindex' => 'boolean',
        ];
    }
}
