<?php

use App\Models\Project;
use Database\Seeders\VenturesSeeder;

it('seeds the two ventures as drafts once', function () {
    $this->seed(VenturesSeeder::class);
    $this->seed(VenturesSeeder::class);

    expect(Project::query()->count())->toBe(2);

    $autolime = Project::query()->where('slug->ka', 'autolime')->firstOrFail();
    expect($autolime->is_published)->toBeFalse()
        ->and($autolime->website_url)->toBe('https://autolime.ge')
        ->and($autolime->status)->toBe('live');

    $this->getJson('/api/v1/projects')->assertOk()->assertJsonPath('meta.total', 0);
});
