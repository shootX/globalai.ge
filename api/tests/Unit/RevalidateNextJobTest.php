<?php

use App\Jobs\RevalidateNextJob;
use Illuminate\Support\Facades\Http;

it('signs the revalidation body with hmac sha256', function () {
    Http::fake([
        'https://web.test/*' => Http::response(['ok' => true], 200),
    ]);

    config([
        'services.next.revalidate_url' => 'https://web.test/api/revalidate',
        'services.next.revalidate_secret' => 'test-signing-secret',
    ]);

    (new RevalidateNextJob('services'))->handle();

    Http::assertSent(function ($request): bool {
        $signature = $request->header('X-GlobalAI-Signature')[0] ?? '';
        $expected = hash_hmac('sha256', $request->body(), 'test-signing-secret');

        return $request->url() === 'https://web.test/api/revalidate'
            && hash_equals($expected, $signature)
            && str_contains($request->body(), '"tag":"services"');
    });
});

it('does nothing when the revalidation webhook is not configured', function () {
    Http::fake();

    config([
        'services.next.revalidate_url' => null,
        'services.next.revalidate_secret' => null,
    ]);

    (new RevalidateNextJob('settings'))->handle();

    Http::assertNothingSent();
});

it('never sends the raw secret and adds a matching timestamp header', function () {
    Http::fake(['https://web.test/*' => Http::response(['ok' => true], 200)]);

    config([
        'services.next.revalidate_url' => 'https://web.test/api/revalidate',
        'services.next.revalidate_secret' => 'test-signing-secret',
    ]);

    (new RevalidateNextJob('pages'))->handle();

    Http::assertSent(function ($request): bool {
        $body = json_decode($request->body(), true);
        $timestamp = $request->header('X-GlobalAI-Timestamp')[0] ?? '';

        return ! $request->hasHeader('X-Revalidate-Secret')
            && ! $request->hasHeader('Authorization')
            && ! str_contains(implode(' ', array_merge(...array_values($request->headers()))), 'test-signing-secret')
            && $timestamp === (string) $body['timestamp']
            && abs(now()->getTimestamp() - (int) $timestamp) < 5;
    });
});

it('retries three times with backoff', function () {
    $job = new RevalidateNextJob('team');

    expect($job->tries)->toBe(3);
    expect($job->backoff)->toBe([10, 60, 300]);
});
