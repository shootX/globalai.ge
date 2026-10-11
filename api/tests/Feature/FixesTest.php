<?php

use App\Models\ContactSubmission;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use League\Flysystem\CorruptedPathDetected;

beforeEach(fn () => Queue::fake());

// 1. Translatable settings round-trip

it('returns contact_address as a full ka/en/ru object after saving', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson('/api/v1/admin/settings', [
        'contact_address' => ['ka' => 'თბილისი', 'en' => 'Tbilisi', 'ru' => 'Тбилиси'],
    ])->assertOk()
        ->assertJsonPath('data.contact_address', ['ka' => 'თბილისი', 'en' => 'Tbilisi', 'ru' => 'Тбилиси']);

    $this->getJson('/api/v1/admin/settings')
        ->assertJsonPath('data.contact_address', ['ka' => 'თბილისი', 'en' => 'Tbilisi', 'ru' => 'Тбилиси']);
});

it('fills missing locales with null instead of returning [] for partial or empty addresses', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson('/api/v1/admin/settings', ['contact_address' => ['ka' => 'თბილისი', 'en' => '', 'ru' => null]])
        ->assertOk()
        ->assertJsonPath('data.contact_address', ['ka' => 'თბილისი', 'en' => null, 'ru' => null]);

    $this->putJson('/api/v1/admin/settings', ['contact_address' => ['ka' => '', 'en' => '', 'ru' => '']])
        ->assertOk()
        ->assertJsonPath('data.contact_address', ['ka' => null, 'en' => null, 'ru' => null]);

    expect(Setting::getValue('contact_address'))->toBeNull();
});

it('fills stat labels as full objects in admin responses', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson('/api/v1/admin/settings', ['stats' => [['value' => '10+', 'label' => ['ka' => 'წელი']]]])
        ->assertOk()
        ->assertJsonPath('data.stats.0.label', ['ka' => 'წელი', 'en' => null, 'ru' => null]);
});

it('resolves translatable settings to one locale publicly, falling back to ka', function () {
    Setting::putValue('contact_address', ['ka' => 'თბილისი', 'en' => 'Tbilisi']);

    $this->getJson('/api/v1/settings?locale=en')->assertJsonPath('data.contact_address', 'Tbilisi');
    $this->getJson('/api/v1/settings?locale=ru')->assertJsonPath('data.contact_address', 'თბილისი');

    Setting::putValue('contact_address', []);
    $this->getJson('/api/v1/settings?locale=ka')->assertJsonPath('data.contact_address', null);
});

// 2. Localized validation messages

it('localizes validation messages from ?locale= and Accept-Language, defaulting to ka', function () {
    // Symfony test requests send "Accept-Language: en-us" by default; blank it to test the ka default.
    $ka = $this->withHeader('Accept-Language', '')->postJson('/api/v1/contact', [])->assertUnprocessable()->json('errors.email.0');
    expect($ka)->not->toStartWith('validation.')->toContain('სავალდებულოა');

    $en = $this->withHeader('Accept-Language', 'en-US,en;q=0.9')->postJson('/api/v1/contact', [])->json('errors.email.0');
    expect($en)->toBe('The email field is required.');

    // ?locale= wins over Accept-Language.
    $ru = $this->withHeader('Accept-Language', 'en')->postJson('/api/v1/contact?locale=ru', [])->json('errors.email.0');
    expect($ru)->toContain('обязательно');
});

it('localizes rule messages like validation.in', function () {
    Sanctum::actingAs(User::factory()->create());
    $submission = ContactSubmission::factory()->create();

    $message = $this->patchJson("/api/v1/admin/submissions/{$submission->id}?locale=en", ['status' => 'bogus'])
        ->assertUnprocessable()->json('errors.status.0');

    expect($message)->not->toBe('validation.in')->toContain('invalid');
});

// 3. DELETE endpoints

it('requires a token for the new delete endpoints', function () {
    $submission = ContactSubmission::factory()->create();

    $this->deleteJson("/api/v1/admin/submissions/{$submission->id}")->assertUnauthorized();
    $this->deleteJson('/api/v1/admin/uploads', ['path' => 'uploads/x.png'])->assertUnauthorized();
    expect(ContactSubmission::query()->count())->toBe(1);
});

it('deletes a submission and 404s for a missing one', function () {
    Sanctum::actingAs(User::factory()->create());
    $submission = ContactSubmission::factory()->create();

    $this->deleteJson("/api/v1/admin/submissions/{$submission->id}")->assertNoContent();
    expect(ContactSubmission::query()->find($submission->id))->toBeNull();

    $this->deleteJson("/api/v1/admin/submissions/{$submission->id}")->assertNotFound();
});

it('deletes an uploaded file by path (body or query) and 404s when missing', function () {
    Storage::fake('public');
    Sanctum::actingAs(User::factory()->create());

    $path = $this->post('/api/v1/admin/uploads', ['file' => UploadedFile::fake()->image('a.png')], ['Accept' => 'application/json'])
        ->assertCreated()->json('data.path');
    Storage::disk('public')->assertExists($path);

    $this->deleteJson('/api/v1/admin/uploads', ['path' => $path])->assertNoContent();
    Storage::disk('public')->assertMissing($path);
    $this->deleteJson('/api/v1/admin/uploads', ['path' => $path])->assertNotFound();

    Storage::disk('public')->put('uploads/q.png', 'x');
    $this->deleteJson('/api/v1/admin/uploads?path=uploads/q.png')->assertNoContent();
    Storage::disk('public')->assertMissing('uploads/q.png');
});

it('rejects unsafe upload paths with 422 and leaves files alone', function (?string $path) {
    Storage::fake('public');
    Storage::disk('public')->put('keep.txt', 'x');
    Storage::disk('public')->put('uploads/keep.png', 'x');
    Sanctum::actingAs(User::factory()->create());

    $this->deleteJson('/api/v1/admin/uploads', ['path' => $path])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('path');

    Storage::disk('public')->assertExists('keep.txt');
    Storage::disk('public')->assertExists('uploads/keep.png');
})->with([
    'missing' => [null],
    'traversal to .env' => ['../../.env'],
    'traversal inside uploads' => ['uploads/../keep.txt'],
    'encoded-style dots' => ['uploads/./keep.png/..'],
    'absolute' => ['/etc/passwd'],
    'absolute uploads' => ['/uploads/keep.png'],
    'outside uploads' => ['keep.txt'],
    'uploads dir itself' => ['uploads'],
    'backslash' => ['uploads\\..\\keep.txt'],
    'scheme' => ['file:///etc/passwd'],
    'windows drive' => ['C:/x'],
    'url-encoded traversal' => ['uploads/%2e%2e%2f%2e%2e%2f.env'],
    'url-encoded uppercase' => ['uploads/%2E%2E/keep.txt'],
    'double-encoded traversal' => ['uploads/%252e%252e%252f%252e%252e%252f.env'],
    'triple-encoded traversal' => ['uploads/%25252e%25252e%25252fkeep.txt'],
    'encoded backslash' => ['uploads%5c..%5ckeep.txt'],
    'double-encoded backslash' => ['uploads/..%255ckeep.txt'],
    'encoded slash prefix' => ['%2fetc%2fpasswd'],
    'encoded NUL' => ['uploads/keep.png%00.txt'],
    'stray percent' => ['uploads/100%.png'],
    'leftover percent after decoding' => ['uploads/%2525zz.png'],
]);

it('rejects NUL and control characters in the path via query and body with 422', function (string $via, string $raw) {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/x.png', 'x');
    Sanctum::actingAs(User::factory()->create());

    $response = $via === 'query'
        ? $this->deleteJson('/api/v1/admin/uploads?path='.$raw)
        : $this->deleteJson('/api/v1/admin/uploads', ['path' => rawurldecode($raw)]);

    $response->assertUnprocessable()->assertJsonValidationErrors('path');
    Storage::disk('public')->assertExists('uploads/x.png');
})->with([
    'query trailing NUL' => ['query', 'uploads/x.png%00'],
    'query leading NUL' => ['query', '%00uploads/x.png'],
    'query inner NUL' => ['query', 'uploads/x%00.png'],
    'query encoded NUL (%2500)' => ['query', 'uploads/x.png%2500'],
    'query trailing newline' => ['query', 'uploads/x.png%0A'],
    'query tab' => ['query', 'uploads/x%09.png'],
    'query DEL' => ['query', 'uploads/x.png%7F'],
    'body trailing NUL' => ['body', 'uploads/x.png%00'],
    'body inner NUL' => ['body', 'uploads/x%00.png'],
    'body literal %00' => ['body', 'uploads/x.png%2500'],
    'body carriage return' => ['body', 'uploads/x.png%0D'],
]);

it('rejects invalid UTF-8 in the path via query and body with 422', function (string $via, string $encoded) {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/x.png', 'x');
    Sanctum::actingAs(User::factory()->create());

    // Body is sent as form data: invalid UTF-8 cannot be JSON-encoded.
    $response = $via === 'query'
        ? $this->deleteJson('/api/v1/admin/uploads?path='.$encoded)
        : $this->delete('/api/v1/admin/uploads', ['path' => rawurldecode($encoded)], ['Accept' => 'application/json']);

    $response->assertUnprocessable()->assertJsonValidationErrors('path');
    Storage::disk('public')->assertExists('uploads/x.png');
})->with(function () {
    $cases = [
        'overlong NUL' => 'uploads/x.png%c0%80',
        'lone FF' => 'uploads/%ff.png',
        'overlong slash' => 'uploads/%c0%af.png',
        'overlong 3-byte' => 'uploads/%e0%80%af.png',
        'truncated sequence' => 'uploads/x%e2%82.png',
        'UTF-16 surrogate' => 'uploads/%ed%a0%80.png',
        'lone continuation' => 'uploads/%80.png',
        'double-encoded FF' => 'uploads/%25ff.png',
    ];

    foreach (['query', 'body'] as $via) {
        foreach ($cases as $name => $value) {
            yield "{$via} {$name}" => [$via, $value];
        }
    }
});

it('rejects a non-string path with 422', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->deleteJson('/api/v1/admin/uploads', ['path' => ['uploads/x.png']])->assertUnprocessable();
    $this->deleteJson('/api/v1/admin/uploads?path[]=uploads/x.png')->assertUnprocessable();
    $this->deleteJson('/api/v1/admin/uploads', ['path' => 123])->assertUnprocessable();
});

it('turns Flysystem path errors during delete into 422', function () {
    Sanctum::actingAs(User::factory()->create());

    Storage::shouldReceive('disk')->with('public')->andReturn($disk = Mockery::mock());
    $disk->shouldReceive('exists')->andThrow(CorruptedPathDetected::forPath('uploads/x.png'));

    $this->deleteJson('/api/v1/admin/uploads', ['path' => 'uploads/x.png'])
        ->assertUnprocessable()->assertJsonValidationErrors('path');
});

it('says yes/no for boolean validation', function (string $locale, string $expected) {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson("/api/v1/admin/settings?locale={$locale}", ['team_visible' => 'maybe'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.team_visible.0', $expected);
})->with([
    'ka' => ['ka', 'გუნდის ჩვენება უნდა იყოს კი ან არა.'],
    'en' => ['en', 'The show team field must be yes or no.'],
    'ru' => ['ru', 'Поле показ команды должно быть да или нет.'],
]);

it('rejects encoded traversal sent as a query string with 422', function () {
    Storage::fake('public');
    Storage::disk('public')->put('keep.txt', 'x');
    Sanctum::actingAs(User::factory()->create());

    // The query value arrives decoded once by PHP, so this is "uploads/%2e%2e%2fkeep.txt" server-side.
    $this->deleteJson('/api/v1/admin/uploads?path=uploads/%252e%252e%252fkeep.txt')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('path');

    Storage::disk('public')->assertExists('keep.txt');
});

it('still deletes a normal upload path after decoding checks', function () {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/ok-file_1.png', 'x');
    Sanctum::actingAs(User::factory()->create());

    $this->deleteJson('/api/v1/admin/uploads', ['path' => 'uploads/ok-file_1.png'])->assertNoContent();
    Storage::disk('public')->assertMissing('uploads/ok-file_1.png');
});

it('translates nested translatable attribute names', function (string $locale, string $title, string $label) {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson('/api/v1/admin/settings?locale='.$locale, ['stats' => [['value' => '1', 'label' => ['en' => 'x']]]])
        ->assertUnprocessable()
        ->assertJsonPath('errors', fn (array $e) => str_contains($e['stats.0.label.ka'][0], $label));

    $projectErrors = $this->postJson("/api/v1/admin/projects?locale={$locale}", ['title' => ['en' => 'x']])
        ->assertUnprocessable()->json('errors');
    expect($projectErrors['title.ka'][0])->toContain($title)->not->toContain('title.ka');
})->with([
    'ka' => ['ka', 'სათაური (ქართული)', 'წარწერა (ქართული)'],
    'en' => ['en', 'title (Georgian)', 'label (Georgian)'],
    'ru' => ['ru', 'заголовок (грузинский)', 'подпись (грузинский)'],
]);

it('translates the "(and :count more errors)" summary', function (string $locale, string $expected) {
    // ?locale= also satisfies the body "locale" field, so name, email and message fail: 1 + 2 more.
    $message = $this->postJson("/api/v1/contact?locale={$locale}", [])->assertUnprocessable()->json('message');

    expect($message)->toContain($expected);
})->with([
    'ka' => ['ka', '(და კიდევ 2 შეცდომა)'],
    'en' => ['en', '(and 2 more errors)'],
    'ru' => ['ru', '(и ещё 2 ошибки)'],
]);
