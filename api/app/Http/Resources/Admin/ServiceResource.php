<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\ReadsTranslations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    use ReadsTranslations;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->translationMap('slug'),
            'title' => $this->translationMap('title'),
            'summary' => $this->translationMap('summary'),
            'body' => $this->translationMap('body'),
            'seo_title' => $this->translationMap('seo_title'),
            'seo_description' => $this->translationMap('seo_description'),
            'sort_order' => $this->sort_order,
            'is_published' => $this->is_published,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
