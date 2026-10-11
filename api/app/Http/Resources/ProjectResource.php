<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\ReadsTranslations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'category' => $this->translated('category'),
            'cover_image' => $this->cover_image,
            'sort_order' => $this->sort_order,
        ];
    }
}
