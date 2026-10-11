<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use App\Models\Concerns\HasPublishing;
use Database\Factories\TeamMemberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

#[Fillable(['name', 'role', 'bio', 'photo', 'sort_order', 'is_published'])]
class TeamMember extends Model
{
    /** @use HasFactory<TeamMemberFactory> */
    use Auditable, HasFactory, HasPublishing, HasTranslations;

    /** @var array<int, string> */
    public array $translatable = [
        'name',
        'role',
        'bio',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
