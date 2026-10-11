<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureTokenIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $expires = $token->expires_at;

            if ($expires instanceof \DateTimeInterface && $expires->isPast()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            if ($expires === null && $token->getKey()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        }

        return $next($request);
    }
}
