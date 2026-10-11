<?php

namespace App\Http\Requests\Admin;

use App\Models\Service;
use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;

class UpsertServiceRequest extends FormRequest
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
        $service = $this->route('service');

        return [
            ...TranslatableRules::text('title', required: true, max: 255),
            ...TranslatableRules::text('summary', required: false, max: 1000),
            ...TranslatableRules::text('body', required: false, max: 20000),
            ...TranslatableRules::text('seo_title', required: false, max: 255),
            ...TranslatableRules::text('seo_description', required: false, max: 320),
            ...TranslatableRules::slug('services', $service instanceof Service ? $service->id : null),
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
