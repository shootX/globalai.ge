<?php

namespace App\Http\Requests\Admin;

use App\Models\Project;
use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;

class UpsertProjectRequest extends FormRequest
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
        $project = $this->route('project');

        return [
            ...TranslatableRules::text('title', required: true, max: 255),
            ...TranslatableRules::text('summary', required: false, max: 1000),
            ...TranslatableRules::text('body', required: false, max: 20000),
            ...TranslatableRules::text('category', required: false, max: 255),
            ...TranslatableRules::text('seo_title', required: false, max: 255),
            ...TranslatableRules::text('seo_description', required: false, max: 320),
            ...TranslatableRules::slug('projects', $project instanceof Project ? $project->id : null),
            'og_image' => ['sometimes', 'nullable', 'string', 'max:2048', 'regex:/^(uploads\/[A-Za-z0-9][A-Za-z0-9._-]*|\/brand\/[A-Za-z0-9][A-Za-z0-9._-]*)$/'],
            'noindex' => ['sometimes', 'boolean'],
            'cover_image' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'gallery' => ['sometimes', 'nullable', 'array', 'max:30'],
            'gallery.*' => ['string', 'max:2048'],
            'website_url' => ['sometimes', 'nullable', 'string', 'max:2048', 'url:http,https'],
            'status' => ['sometimes', 'string', 'in:'.implode(',', Project::STATUSES)],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
