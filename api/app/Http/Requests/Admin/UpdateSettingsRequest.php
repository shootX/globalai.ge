<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
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
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'contact_address' => ['sometimes', 'array'],
            'contact_address.ka' => ['nullable', 'string', 'max:500'],
            'contact_address.en' => ['nullable', 'string', 'max:500'],
            'contact_address.ru' => ['nullable', 'string', 'max:500'],
            'socials' => ['sometimes', 'array'],
            'socials.instagram' => ['nullable', 'string', 'max:255'],
            'socials.facebook' => ['nullable', 'string', 'max:255'],
            'socials.linkedin' => ['nullable', 'string', 'max:255'],
            'socials.behance' => ['nullable', 'string', 'max:255'],
            'logo' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'stats' => ['sometimes', 'array', 'max:12'],
            'stats.*.value' => ['required', 'string', 'max:50'],
            'stats.*.label' => ['required', 'array'],
            'stats.*.label.ka' => ['required', 'string', 'max:255'],
            'stats.*.label.en' => ['nullable', 'string', 'max:255'],
            'stats.*.label.ru' => ['nullable', 'string', 'max:255'],
            'projects_nav_visible' => ['sometimes', 'boolean'],
            'team_visible' => ['sometimes', 'boolean'],
            'stats_visible' => ['sometimes', 'boolean'],
        ];
    }
}
