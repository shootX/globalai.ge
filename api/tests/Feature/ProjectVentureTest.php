<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;

it('stores a venture website and status and returns them publicly', function () {
    Queue::fake();
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/projects', [
        'title' => ['ka' => 'ავტოლაიმი'],
        'slug' => ['ka' => 'autolime'],
        'website_url' => 'https://autolime.ge',
        'status' => 'building',
        'is_published' => true,
    ])->assertCreated()
        ->assertJsonPath('data.website_url', 'https://autolime.ge')
        ->assertJsonPath('data.status', 'building');

    $this->getJson('/api/v1/projects')
        ->assertOk()
        ->assertJsonPath('data.0.website_url', 'https://autolime.ge')
        ->assertJsonPath('data.0.status', 'building');

    $this->getJson('/api/v1/projects/autolime')
        ->assertOk()
        ->assertJsonPath('data.website_url', 'https://autolime.ge');
});

it('defaults the status to live and clears an empty website', function () {
    Queue::fake();
    Sanctum::actingAs(User::factory()->create());

    $id = $this->postJson('/api/v1/admin/projects', [
        'title' => ['ka' => 'გოქარი'],
        'slug' => ['ka' => 'gocar'],
        'website_url' => 'https://gocar.ge',
    ])->assertCreated()
        ->assertJsonPath('data.status', 'live')
        ->json('data.id');

    $this->putJson("/api/v1/admin/projects/{$id}", [
        'title' => ['ka' => 'გოქარი'],
        'slug' => ['ka' => 'gocar'],
        'website_url' => '',
    ])->assertOk()
        ->assertJsonPath('data.website_url', null);

    expect(Project::query()->findOrFail($id)->website_url)->toBeNull();
});

it('rejects an unknown status and a non-http website', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/projects', [
        'title' => ['ka' => 'პროექტი'],
        'slug' => ['ka' => 'proekti'],
        'website_url' => 'javascript:alert(1)',
        'status' => 'archived',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['website_url', 'status']);
});
