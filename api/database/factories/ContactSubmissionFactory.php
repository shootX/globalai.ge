<?php

namespace Database\Factories;

use App\Models\ContactSubmission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactSubmission>
 */
class ContactSubmissionFactory extends Factory
{
    protected $model = ContactSubmission::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => null,
            'subject' => null,
            'message' => fake()->paragraph(),
            'locale' => 'ka',
            'ip' => fake()->ipv4(),
            'user_agent' => 'Pest',
            'status' => ContactSubmission::STATUS_NEW,
        ];
    }
}
