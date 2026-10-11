<?php

use App\Jobs\RevalidateNextJob;
use App\Models\ContactSubmission;
use App\Models\Page;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

it('returns 401 on admin routes without a token', function () {
    $routes = [
        ['GET', '/api/v1/admin/services'],
        ['GET', '/api/v1/admin/projects'],
        ['GET', '/api/v1/admin/team'],
        ['GET', '/api/v1/admin/pages'],
        ['GET', '/api/v1/admin/settings'],
        ['GET', '/api/v1/admin/submissions'],
        ['POST', '/api/v1/admin/uploads'],
        ['POST', '/api/v1/admin/logout'],
    ];

    foreach ($routes as [$method, $uri]) {
        $this->json($method, $uri)->assertUnauthorized();
    }
});

it('logs an admin in and out without returning the password', function () {
    $password = 'local-test-'.Str::password(24);
    $user = User::factory()->create([
        'email' => 'admin@globalai.ge',
        'password' => $password,
    ]);

    $login = $this->postJson('/api/v1/admin/login', [
        'email' => $user->email,
        'password' => $password,
    ])->assertOk();

    expect($login->getContent())->not->toContain($password);
    expect($login->json('data.user'))->not->toHaveKey('password');

    $token = $login->json('data.token');

    $this->withToken($token)->postJson('/api/v1/admin/logout')->assertOk();

    // The test client keeps the Sanctum guard in memory after logout.
    Auth::forgetGuards();

    $this->withToken($token)->getJson('/api/v1/admin/services')->assertUnauthorized();

    $this->postJson('/api/v1/admin/login', [
        'email' => $user->email,
        'password' => 'wrong-password-value',
    ])->assertUnprocessable();
});

it('requires a georgian value on translatable admin writes', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/services', [
        'title' => ['en' => 'Branding'],
        'slug' => ['en' => 'branding'],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['title.ka', 'slug.ka']);
});

it('creates updates and deletes a service and dispatches revalidation', function () {
    Queue::fake();
    Sanctum::actingAs(User::factory()->create());

    $this->getJson('/api/v1/admin/services')
        ->assertOk()
        ->assertHeader('Cache-Control', 'no-store, private')
        ->assertJsonPath('meta.total', 0);

    $created = $this->postJson('/api/v1/admin/services', [
        'title' => ['ka' => 'ბრენდინგი', 'en' => 'Branding', 'ru' => 'Брендинг'],
        'slug' => ['ka' => 'brendingi', 'en' => 'branding', 'ru' => 'brending'],
        'summary' => ['ka' => 'მოკლე'],
        'is_published' => true,
        'sort_order' => 3,
    ])->assertCreated()
        ->assertJsonPath('data.title.ka', 'ბრენდინგი')
        ->assertJsonPath('data.title.en', 'Branding')
        ->assertJsonPath('data.title.ru', 'Брендинг')
        ->assertJsonPath('data.slug.en', 'branding')
        ->assertJsonPath('data.is_published', true);

    $id = $created->json('data.id');

    $this->putJson("/api/v1/admin/services/{$id}", [
        'title' => ['ka' => 'ბრენდინგი 2', 'en' => 'Branding'],
        'slug' => ['ka' => 'brendingi', 'en' => 'branding'],
        'is_published' => false,
    ])->assertOk()
        ->assertJsonPath('data.title.ka', 'ბრენდინგი 2')
        ->assertJsonPath('data.title.ru', null)
        ->assertJsonPath('data.is_published', false);

    $this->deleteJson("/api/v1/admin/services/{$id}")->assertNoContent();

    expect(Service::query()->find($id))->toBeNull();
    Queue::assertPushed(RevalidateNextJob::class, 3);
    Queue::assertPushed(RevalidateNextJob::class, fn (RevalidateNextJob $job) => $job->tag === 'services');
});

it('dispatches revalidation when projects pages team and settings change', function () {
    Queue::fake();
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/admin/projects', [
        'title' => ['ka' => 'სახლი'],
        'slug' => ['ka' => 'sakhli', 'en' => 'house', 'ru' => 'dom'],
        'category' => ['ka' => 'არქიტექტურა', 'en' => 'Architecture'],
        'cover_image' => 'uploads/cover.jpg',
        'gallery' => ['uploads/one.jpg'],
        'is_published' => true,
    ])->assertCreated()
        ->assertJsonPath('data.slug', [
            'ka' => 'sakhli',
            'en' => 'house',
            'ru' => 'dom',
        ]);

    $this->putJson('/api/v1/admin/pages/about', [
        'content' => [
            'ka' => ['blocks' => [['type' => 'richtext', 'body' => 'გამარჯობა']]],
            'en' => ['blocks' => []],
        ],
        'seo_title' => ['ka' => 'ჩვენ შესახებ', 'en' => 'About'],
    ])->assertOk()
        ->assertJsonPath('data.content.ka.blocks.0.body', 'გამარჯობა');

    $this->postJson('/api/v1/admin/team', [
        'name' => ['ka' => 'ანა', 'en' => 'Ana'],
        'role' => ['ka' => 'დიზაინერი', 'en' => 'Designer'],
        'is_published' => false,
    ])->assertCreated()
        ->assertJsonPath('data.name.ka', 'ანა');

    $this->putJson('/api/v1/admin/settings', [
        'contact_email' => 'hello@globalai.ge',
        'contact_address' => ['ka' => 'თბილისი', 'en' => 'Tbilisi'],
        'projects_nav_visible' => true,
        'team_visible' => false,
        'stats_visible' => false,
        'next_revalidate_secret' => 'should-not-stick',
    ])->assertOk()
        ->assertJsonPath('data.contact_email', 'hello@globalai.ge')
        ->assertJsonPath('data.contact_address.ka', 'თბილისი')
        ->assertJsonPath('data.projects_nav_visible', true);

    expect(Setting::getValue('next_revalidate_secret'))->toBeNull();
    expect(Page::query()->where('key', 'about')->exists())->toBeTrue();

    Queue::assertPushed(RevalidateNextJob::class, fn (RevalidateNextJob $job) => $job->tag === 'projects');
    Queue::assertPushed(RevalidateNextJob::class, fn (RevalidateNextJob $job) => $job->tag === 'pages');
    Queue::assertPushed(RevalidateNextJob::class, fn (RevalidateNextJob $job) => $job->tag === 'team');
    Queue::assertPushed(RevalidateNextJob::class, fn (RevalidateNextJob $job) => $job->tag === 'settings');
});

it('lists submissions and changes status without revalidating the site', function () {
    Queue::fake();
    Sanctum::actingAs(User::factory()->create());

    $submission = ContactSubmission::factory()->create([
        'name' => 'გიორგი',
        'status' => 'new',
    ]);

    $this->getJson('/api/v1/admin/submissions')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.name', 'გიორგი');

    $this->patchJson("/api/v1/admin/submissions/{$submission->id}", [
        'status' => 'read',
    ])->assertOk()->assertJsonPath('data.status', 'read');

    $this->patchJson("/api/v1/admin/submissions/{$submission->id}", [
        'status' => 'published',
    ])->assertUnprocessable();

    Queue::assertNothingPushed();
});

it('uploads an image for an admin and rejects other files', function () {
    Storage::fake('public');
    Sanctum::actingAs(User::factory()->create());

    $uploaded = $this->post('/api/v1/admin/uploads', [
        'file' => UploadedFile::fake()->image('cover.jpg', 40, 40),
    ], ['Accept' => 'application/json'])
        ->assertCreated()
        ->assertJsonStructure(['data' => ['path', 'url']]);

    Storage::disk('public')->assertExists($uploaded->json('data.path'));

    $this->post('/api/v1/admin/uploads', [
        'file' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
    ], ['Accept' => 'application/json'])->assertUnprocessable();
});
