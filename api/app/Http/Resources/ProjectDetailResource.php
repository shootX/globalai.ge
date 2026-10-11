<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\ReadsTranslations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDetailResource extends JsonResource
{
    use ReadsTranslations;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->translated('slug'),
            'title' => $this->translated('title'),
            'summary' => $this->translated('summary'),
            'body' => $this->translated('body'),
            'category' => $this->translated('category'),
            'cover_image' => $this->cover_image,
            'gallery' => $this->gallery ?? [],
            'seo_title' => $this->translated('seo_title'),
            'seo_description' => $this->translated('seo_description'),
            'og_image' => $this->og_image,
            'noindex' => (bool) $this->noindex,
            'sort_order' => $this->sort_order,
            'alternates' => $this->slugAlternates(),
        ];
    }
}
