<?php

namespace App\Http\Requests\Admin;

use App\Models\Page;
use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertPageRequest extends FormRequest
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
        $page = $this->route('page');
        $keyRules = ['required', 'string', Rule::in(Page::KEYS), Rule::unique('pages', 'key')];

        if ($page instanceof Page) {
            $keyRules = ['sometimes', 'string', Rule::in(Page::KEYS), Rule::unique('pages', 'key')->ignore($page->id)];
        }

        return [
            'key' => $keyRules,
            'content' => ['required', 'array'],
            'content.ka' => ['required', 'array'],
            'content.en' => ['nullable', 'array'],
            'content.ru' => ['nullable', 'array'],
            ...TranslatableRules::text('seo_title', required: false, max: 255),
            ...TranslatableRules::text('seo_description', required: false, max: 320),
        ];
    }
}
