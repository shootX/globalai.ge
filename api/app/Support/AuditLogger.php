<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

final class AuditLogger
{
    public const ACTIONS = [
        'created',
        'updated',
        'deleted',
        'uploaded',
        'settings_changed',
        'login',
        'token_created',
        'token_revoked',
    ];

    /**
     * @param  array<string, mixed>|null  $old
     * @param  array<string, mixed>|null  $new
     */
    public static function write(
        string $action,
        ?Model $model,
        ?array $old,
        ?array $new,
        ?int $userId = null,
        ?string $modelType = null,
        ?int $modelId = null,
    ): void {
        if (! in_array($action, self::ACTIONS, true)) {
            return;
        }

        $request = request();

        AuditLog::query()->create([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'model_type' => $modelType ?? ($model !== null ? $model::class : null),
            'model_id' => $modelId ?? ($model !== null ? $model->getKey() : null),
            'old_values' => self::scrub($old),
            'new_values' => self::scrub($new),
            'ip' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>|null  $values
     * @return array<string, mixed>|null
     */
    public static function scrub(?array $values): ?array
    {
        if ($values === null) {
            return null;
        }

        $clean = [];

        foreach ($values as $key => $value) {
            if (is_string($key) && self::isSecretKey($key)) {
                continue;
            }

            if (is_array($value)) {
                $clean[$key] = self::scrub($value);

                continue;
            }

            if (is_string($value) && self::isSecretValue($value)) {
                continue;
            }

            $clean[$key] = $value;
        }

        return $clean;
    }

    public static function isSecretKey(string $key): bool
    {
        $key = strtolower($key);

        if (in_array($key, ['token_id', 'expires_at', 'last_used_at'], true)) {
            return false;
        }

        foreach (['password', 'remember_token', 'token', 'secret', 'authorization', 'api_key'] as $needle) {
            if ($key === $needle || str_contains($key, $needle)) {
                return true;
            }
        }

        return false;
    }

    public static function isSecretValue(string $value): bool
    {
        return (bool) preg_match('/^\d+\|[A-Za-z0-9]{16,}$/', $value);
    }
}
