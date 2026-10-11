<?php

use App\Mail\ContactSubmissionReceived;
use App\Models\ContactSubmission;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;

function contactPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'ნინო ბერიძე',
        'email' => 'nino@example.com',
        'phone' => '+995555112233',
        'subject' => 'ახალი საიტი',
        'message' => 'გვინდა ახალი საიტი globalAI-სთვის.',
        'locale' => 'ka',
    ], $overrides);
}

it('validates a contact submission', function () {
    $this->postJson('/api/v1/contact', [
        'email' => 'not-an-email',
        'locale' => 'de',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'message', 'locale']);

    expect(ContactSubmission::query()->count())->toBe(0);
});

it('stores a contact submission and queues mail to the admin', function () {
    Mail::fake();
    Setting::putValue('contact_email', 'studio@globalai.ge');

    $response = $this->postJson('/api/v1/contact', contactPayload())
        ->assertCreated()
        ->assertExactJson(['data' => ['accepted' => true]]);

    expect($response->headers->get('Cache-Control'))->toContain('no-store');

    $submission = ContactSubmission::query()->first();

    expect($submission)->not->toBeNull()
        ->and($submission->locale)->toBe('ka')
        ->and($submission->status)->toBe('new')
        ->and($submission->ip)->not->toBeNull();

    Mail::assertQueued(ContactSubmissionReceived::class, function (ContactSubmissionReceived $mail): bool {
        return $mail->hasTo('studio@globalai.ge');
    });
});

it('rate limits contact posts to five per minute', function () {
    Mail::fake();
    Setting::putValue('contact_email', 'studio@globalai.ge');

    foreach (range(1, 5) as $attempt) {
        $this->postJson('/api/v1/contact', contactPayload([
            'email' => "person{$attempt}@example.com",
        ]))->assertCreated();
    }

    $this->postJson('/api/v1/contact', contactPayload([
        'email' => 'sixth@example.com',
    ]))->assertTooManyRequests();

    expect(ContactSubmission::query()->count())->toBe(5);
});

it('drops honeypot submissions without storing or emailing them', function () {
    Mail::fake();
    Setting::putValue('contact_email', 'studio@globalai.ge');

    $this->postJson('/api/v1/contact', contactPayload([
        'company_website' => 'https://spam.example',
    ]))->assertCreated()
        ->assertExactJson(['data' => ['accepted' => true]]);

    expect(ContactSubmission::query()->count())->toBe(0);
    Mail::assertNothingQueued();
});
