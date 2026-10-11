<?php

namespace Database\Factories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        return [
            'key' => fake()->unique()->randomElement(Page::KEYS),
            'content' => ['ka' => ['blocks' => []]],
            'seo_title' => ['ka' => fake()->sentence(2)],
            'seo_description' => ['ka' => fake()->sentence()],
        ];
    }
}
