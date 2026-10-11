<?php

namespace App\Http\Requests\Admin;

use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;

class UpsertTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...TranslatableRules::text('name', required: true, max: 255),
            ...TranslatableRules::text('role', required: true, max: 255),
            ...TranslatableRules::text('bio', required: false, max: 2000),
            'photo' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
