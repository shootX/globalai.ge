<?php

namespace App\Http\Requests\Admin;

use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSeoPageRequest extends FormRequest
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
            ...TranslatableRules::text('seo_title', required: false, max: 255),
            ...TranslatableRules::text('seo_description', required: false, max: 320),
            'og_image' => ['sometimes', 'nullable', 'string', 'max:2048', 'regex:/^(uploads\/[A-Za-z0-9][A-Za-z0-9._-]*|\/brand\/[A-Za-z0-9][A-Za-z0-9._-]*)$/'],
            'noindex' => ['sometimes', 'boolean'],
        ];
    }
}
