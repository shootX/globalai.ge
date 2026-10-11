<?php

namespace App\Http\Requests\Admin;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class DeleteUploadRequest extends FormRequest
{
    public const DIRECTORY = 'uploads';

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'path' => [
                'bail',
                'required',
                'string',
                'max:2048',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (! is_string($value) || ! self::isSafeUploadPath($value)) {
                        $fail('validation.in')->translate();
                    }
                },
            ],
        ];
    }

    /**
     * Only relative paths strictly inside uploads/ on the public disk: no traversal,
     * no absolute paths, no backslashes, NUL bytes or URL schemes, checked after
     * fully percent-decoding the value (no '%' may remain).
     */
    public static function isSafeUploadPath(string $path): bool
    {
        if (! self::isCleanString($path)) {
            return false;
        }

        $path = self::fullyDecode($path);

        if ($path === null || ! self::isCleanString($path)) {
            return false;
        }

        // Anything still percent-encoded after decoding is suspicious (or undecodable): reject.
        if ($path === null || str_contains($path, '%')) {
            return false;
        }

        if ($path === '' || str_contains($path, "\0") || str_contains($path, '\\')
            || str_starts_with($path, '/') || str_contains($path, ':')) {
            return false;
        }

        $segments = explode('/', $path);

        foreach ($segments as $segment) {
            if ($segment === '' || $segment === '.' || $segment === '..') {
                return false;
            }
        }

        return count($segments) >= 2 && $segments[0] === self::DIRECTORY;
    }

    /**
     * Valid UTF-8 (mb_check_encoding rejects overlong forms such as C0 80, lone FF bytes,
     * truncated and surrogate sequences) and free of control characters.
     */
    public static function isCleanString(string $value): bool
    {
        return mb_check_encoding($value, 'UTF-8') && ! self::hasControlCharacters($value);
    }

    /**
     * NUL, C0 control characters (incl. tab/newline) and DEL are never valid in an upload path.
     */
    public static function hasControlCharacters(string $value): bool
    {
        return preg_match('/[\x00-\x1F\x7F]/', $value) === 1;
    }

    /**
     * Percent-decode repeatedly until the value is stable, so double/triple-encoded
     * sequences such as %252e%252e%252f are seen as "../". Returns null if it never settles.
     */
    public static function fullyDecode(string $value, int $maxRounds = 10): ?string
    {
        for ($i = 0; $i < $maxRounds; $i++) {
            $decoded = rawurldecode($value);

            if ($decoded === $value) {
                return $value;
            }

            $value = $decoded;
        }

        return null;
    }

    /**
     * The validated path, decoded to the exact on-disk name that was checked.
     */
    public function uploadPath(): string
    {
        return (string) self::fullyDecode((string) $this->validated('path'));
    }
}
