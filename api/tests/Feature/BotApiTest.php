<?php

use App\Jobs\RevalidateNextJob;
use App\Models\AuditLog;
use App\Models\ContactSubmission;
use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

function adminToken(User $user, ?\DateTimeInterface $expiresAt = null): string
{
    return $user->createToken('test', ['*'], $expiresAt ?? now()->addDay())->plainTextToken;
}

it('prints a bot token once and stores only the hash', function () {
    $exit = Artisan::call('bot:create', ['name' => 'Writer', '--expires' => 7]);
    $output = Artisan::output();

    expect($exit)->toBe(0);
    preg_match_all('/\d+\|[A-Za-z0-9]+/', $output, $matches);
    expect($matches[0])->toHaveCount(1);

    $plain = $matches[0][0];
    $user = User::query()->where('is_bot', true)->firstOrFail();

    expect($user->role)->toBe('admin');
    expect($output)->not->toContain($user->password);

    $token = PersonalAccessToken::query()->where('tokenable_id', $user->id)->firstOrFail();
    expect($token->token)->toBe(hash('sha256', explode('|', $plain, 2)[1]));
    expect($token->token)->not->toBe($plain);
    expect($token->expires_at)->not->toBeNull();
    expect($token->expires_at->isFuture())->toBeTrue();
    expect($token->expires_at->lessThan(now()->addDays(8)))->toBeTrue();
    expect(AuditLog::query()->where('action', 'token_created')->value('new_values'))->not->toContain($plain);
});

it('rejects a missing, expired, or revoked token on admin routes', function () {
    $routes = [
        ['GET', '/api/v1/admin/services'],
        ['GET', '/api/v1/admin/projects'],
        ['GET', '/api/v1/admin/team'],
        ['GET', '/api/v1/admin/pages'],
        ['GET', '/api/v1/admin/settings'],
        ['GET', '/api/v1/admin/submissions'],
        ['GET', '/api/v1/admin/tokens'],
        ['GET', '/api/v1/admin/audit-logs'],
        ['GET', '/api/v1/admin/seo/pages/home'],
        ['POST', '/api/v1/admin/uploads'],
        ['POST', '/api/v1/admin/logout'],
    ];

    $user = User::factory()->create();

    foreach ($routes as [$method, $uri]) {
        $this->json($method, $uri)->assertUnauthorized();
    }

    $plain = adminToken($user, now()->subMinute());
    foreach ($routes as [$method, $uri]) {
        $this->withToken($plain)->json($method, $uri)->assertUnauthorized();
    }

    $open = adminToken($user);
    $id = PersonalAccessToken::query()->where('tokenable_id', $user->id)->where('name', 'test')->where('expires_at', '>', now())->value('id');
    $this->withToken($open)->deleteJson("/api/v1/admin/tokens/{$id}")->assertNoContent();
    Auth::forgetGuards();
    $this->withToken($open)->getJson('/api/v1/admin/services')->assertUnauthorized();

    $bare = $user->createToken('bare')->plainTextToken;
    $this->withToken($bare)->getJson('/api/v1/admin/pages')->assertUnauthorized();
});

it('creates lists and revokes tokens without returning the secret', function () {
    $user = User::factory()->create();
    $editor = User::factory()->create(['role' => 'editor']);

    $this->withToken(adminToken($editor))->getJson('/api/v1/admin/tokens')->assertForbidden();
    $this->withToken(adminToken($editor))->postJson('/api/v1/admin/tokens', ['name' => 'nope'])->assertForbidden();

    Auth::forgetGuards();
    $admin = adminToken($user);

    $created = $this->withToken($admin)->postJson('/api/v1/admin/tokens', [
        'name' => 'ci',
        'expires_in_days' => 10,
    ])->assertCreated();

    $plain = $created->json('data.token');
    expect($plain)->toBeString()->not->toBeEmpty();

    Auth::forgetGuards();
    $listed = $this->withToken($admin)->getJson('/api/v1/admin/tokens')->assertOk();
    expect($listed->getContent())->not->toContain($plain);
    expect($listed->json('data.0'))->not->toHaveKey('token');
    expect($listed->json('data.0.name'))->toBe('ci');
    expect($listed->json('data.0.expires_at'))->not->toBeNull();

    $hash = hash('sha256', explode('|', $plain, 2)[1]);
    expect($listed->getContent())->not->toContain($hash);
    expect(AuditLog::query()->where('action', 'token_created')->get()->toJson())->not->toContain($plain)->not->toContain($hash);
});

it('rate limits the admin api to 120 requests per token', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $limited = adminToken($user);
    $spare = adminToken($other);

    for ($i = 0; $i < 120; $i++) {
        $this->withToken($limited)->getJson('/api/v1/admin/settings')->assertOk();
    }

    $this->withToken($limited)->getJson('/api/v1/admin/settings')->assertStatus(429);
    Auth::forgetGuards();
    $this->withToken($spare)->getJson('/api/v1/admin/settings')->assertOk();
});

it('writes an audit row for every admin write and keeps the log append-only', function () {
    Queue::fake();
    Storage::fake('public');
    $password = 'local-test-password-value';
    $user = User::factory()->create(['password' => $password]);

    $login = $this->postJson('/api/v1/admin/login', [
        'email' => $user->email,
        'password' => $password,
    ])->assertOk();
    $token = $login->json('data.token');

    $this->withToken($token)->postJson('/api/v1/admin/services', [
        'title' => ['ka' => 'ბრენდინგი'],
        'slug' => ['ka' => 'brendingi'],
        'is_published' => true,
    ])->assertCreated();

    $service = Service::query()->firstOrFail();
    $this->withToken($token)->putJson("/api/v1/admin/services/{$service->id}", [
        'title' => ['ka' => 'ბრენდინგი 2'],
        'slug' => ['ka' => 'brendingi'],
    ])->assertOk();
    $this->withToken($token)->deleteJson("/api/v1/admin/services/{$service->id}")->assertNoContent();

    $this->withToken($token)->postJson('/api/v1/admin/projects', [
        'title' => ['ka' => 'სახლი'],
        'slug' => ['ka' => 'sakhli'],
    ])->assertCreated();

    $this->withToken($token)->postJson('/api/v1/admin/team', [
        'name' => ['ka' => 'ანა'],
        'role' => ['ka' => 'დიზაინერი'],
    ])->assertCreated();

    $this->withToken($token)->putJson('/api/v1/admin/pages/about', [
        'content' => ['ka' => ['intro' => 'გამარჯობა']],
    ])->assertOk();

    $this->withToken($token)->putJson('/api/v1/admin/settings', [
        'contact_email' => 'hello@globalai.ge',
    ])->assertOk();

    $submission = ContactSubmission::factory()->create();
    $this->withToken($token)->patchJson("/api/v1/admin/submissions/{$submission->id}", [
        'status' => 'read',
    ])->assertOk();
    $this->withToken($token)->deleteJson("/api/v1/admin/submissions/{$submission->id}")->assertNoContent();

    $this->withToken($token)->post('/api/v1/admin/uploads', [
        'file' => UploadedFile::fake()->image('cover.jpg', 20, 20),
    ], ['Accept' => 'application/json'])->assertCreated();

    $issued = $this->withToken($token)->postJson('/api/v1/admin/tokens', [
        'name' => 'second',
    ])->assertCreated();
    $this->withToken($token)->deleteJson('/api/v1/admin/tokens/'.$issued->json('data.id'))->assertNoContent();

    $actions = AuditLog::query()->pluck('action')->all();
    foreach (['login', 'created', 'updated', 'deleted', 'uploaded', 'settings_changed', 'token_created', 'token_revoked'] as $action) {
        expect($actions)->toContain($action);
    }

    expect(AuditLog::query()->where('model_type', Project::class)->where('action', 'created')->exists())->toBeTrue();
    expect(AuditLog::query()->where('model_type', TeamMember::class)->where('action', 'created')->exists())->toBeTrue();
    expect(AuditLog::query()->where('model_type', Page::class)->where('action', 'updated')->exists())->toBeTrue();
    expect(AuditLog::query()->where('model_type', Setting::class)->where('action', 'settings_changed')->exists())->toBeTrue();
    expect(AuditLog::query()->where('model_type', ContactSubmission::class)->where('action', 'deleted')->exists())->toBeTrue();

    $blob = AuditLog::query()->get()->toJson();
    expect($blob)->not->toContain($password);
    expect($blob)->not->toContain($token);
    expect($blob)->not->toContain($issued->json('data.token'));

    $this->withToken($token)->putJson('/api/v1/admin/audit-logs')->assertStatus(405);
    $this->withToken($token)->patchJson('/api/v1/admin/audit-logs/1')->assertStatus(405);
    $this->withToken($token)->deleteJson('/api/v1/admin/audit-logs/1')->assertStatus(405);

    $filtered = $this->withToken($token)->getJson('/api/v1/admin/audit-logs?user_id='.$user->id.'&model_type=service&page=1')
        ->assertOk();
    expect($filtered->json('meta.total'))->toBeGreaterThan(0);
    expect($filtered->json('data.0'))->not->toHaveKey('token');
});

it('validates seo and returns it in the requested locale with a ka fallback', function () {
    Queue::fake();
    Sanctum::actingAs(User::factory()->create());

    $this->putJson('/api/v1/admin/seo/pages/home', [
        'seo_title' => ['ka' => str_repeat('ა', 256)],
    ])->assertUnprocessable()->assertJsonValidationErrors(['seo_title.ka']);

    $this->putJson('/api/v1/admin/seo/pages/home', [
        'og_image' => '../secret.png',
    ])->assertUnprocessable()->assertJsonValidationErrors(['og_image']);

    $this->putJson('/api/v1/admin/seo/pages/home', [
        'seo_title' => ['ka' => 'მთავარი', 'en' => ''],
        'seo_description' => ['ka' => 'აღწერა'],
        'og_image' => 'uploads/og.png',
        'noindex' => true,
    ])->assertOk()
        ->assertJsonPath('data.seo_title.ka', 'მთავარი')
        ->assertJsonPath('data.seo_title.en', null)
        ->assertJsonPath('data.noindex', true);

    Queue::assertPushed(RevalidateNextJob::class, fn (RevalidateNextJob $job) => $job->tag === 'pages');

    $this->getJson('/api/v1/pages/home?locale=en')
        ->assertOk()
        ->assertJsonPath('data.seo_title', 'მთავარი')
        ->assertJsonPath('data.seo_description', 'აღწერა')
        ->assertJsonPath('data.og_image', 'uploads/og.png')
        ->assertJsonPath('data.noindex', true);

    $this->getJson('/api/v1/pages/home?locale=ka')
        ->assertJsonPath('data.seo_title', 'მთავარი');

    $service = $this->postJson('/api/v1/admin/services', [
        'title' => ['ka' => 'ვები', 'en' => 'Web'],
        'slug' => ['ka' => 'vebi', 'en' => 'web'],
        'seo_title' => ['ka' => 'სერვისი'],
        'og_image' => '/brand/globalai-logo.png',
        'noindex' => false,
        'is_published' => true,
    ])->assertCreated();

    $this->getJson('/api/v1/services/web?locale=en')
        ->assertOk()
        ->assertJsonPath('data.seo_title', 'სერვისი')
        ->assertJsonPath('data.og_image', '/brand/globalai-logo.png')
        ->assertJsonPath('data.noindex', false);

    expect($service->json('data.og_image'))->toBe('/brand/globalai-logo.png');
    expect(AuditLogger::scrub(['password' => 'secret', 'title' => ['ka' => 'ok'], 'token' => '1|abcdefghijklmnopqrstuvwxyz']))
        ->toBe(['title' => ['ka' => 'ok']]);
});
