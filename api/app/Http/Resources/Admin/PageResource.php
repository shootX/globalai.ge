<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\ReadsTranslations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{
    use ReadsTranslations;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'content' => $this->translationMap('content'),
            'seo_title' => $this->translationMap('seo_title'),
            'seo_description' => $this->translationMap('seo_description'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
