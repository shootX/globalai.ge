<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\ReadsTranslations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamMemberResource extends JsonResource
{
    use ReadsTranslations;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->translationMap('name'),
            'role' => $this->translationMap('role'),
            'bio' => $this->translationMap('bio'),
            'photo' => $this->photo,
            'sort_order' => $this->sort_order,
            'is_published' => $this->is_published,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
