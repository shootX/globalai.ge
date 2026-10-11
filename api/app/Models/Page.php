<?php

namespace App\Models;

use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

#[Fillable(['key', 'content', 'seo_title', 'seo_description'])]
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory, HasTranslations;

    public const KEYS = ['home', 'about', 'services', 'projects', 'contact'];

    /** @var array<int, string> */
    public array $translatable = [
        'content',
        'seo_title',
        'seo_description',
    ];
}
