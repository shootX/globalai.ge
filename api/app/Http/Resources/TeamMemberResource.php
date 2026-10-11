<?php

namespace App\Http\Resources;

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
            'name' => $this->translated('name'),
            'role' => $this->translated('role'),
            'bio' => $this->translated('bio'),
            'photo' => $this->photo,
            'sort_order' => $this->sort_order,
        ];
    }
}
