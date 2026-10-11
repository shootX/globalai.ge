<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

class RevalidateNextJob implements ShouldQueue
{
    use Queueable;

    public const TAGS = ['services', 'projects', 'pages', 'team', 'settings'];

    public function __construct(public string $tag)
    {
        if (! in_array($tag, self::TAGS, true)) {
            throw new InvalidArgumentException('Unknown revalidation tag.');
        }
    }

    public function handle(): void
    {
        $url = config('services.next.revalidate_url');
        $secret = config('services.next.revalidate_secret');

        if (! is_string($url) || $url === '' || ! is_string($secret) || $secret === '') {
            return;
        }

        $payload = json_encode([
            'tag' => $this->tag,
            'timestamp' => now()->getTimestamp(),
        ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);

        $signature = hash_hmac('sha256', $payload, $secret);

        Http::timeout(5)
            ->withHeaders([
                'X-GlobalAI-Signature' => $signature,
                'X-Revalidate-Secret' => $secret,
                'Authorization' => 'Bearer '.$secret,
                'Accept' => 'application/json',
            ])
            ->withBody($payload, 'application/json')
            ->post($url)
            ->throw();
    }
}
