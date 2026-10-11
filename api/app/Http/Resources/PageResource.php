<?php

namespace App\Http\Resources;

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
            'key' => $this->key,
            'content' => $this->translated('content'),
            'seo_title' => $this->translated('seo_title'),
            'seo_description' => $this->translated('seo_description'),
            'og_image' => $this->og_image,
            'noindex' => (bool) $this->noindex,
        ];
    }
}
