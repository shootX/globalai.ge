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
