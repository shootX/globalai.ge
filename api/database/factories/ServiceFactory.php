<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        $slug = fake()->unique()->slug(2);

        return [
            'slug' => ['ka' => $slug],
            'title' => ['ka' => fake()->sentence(3)],
            'summary' => ['ka' => fake()->sentence()],
            'body' => ['ka' => fake()->paragraph()],
            'sort_order' => 0,
            'is_published' => false,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => ['is_published' => true]);
    }
}
