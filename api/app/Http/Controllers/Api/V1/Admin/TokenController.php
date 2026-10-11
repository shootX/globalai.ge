<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTokenRequest;
use App\Http\Resources\Admin\TokenResource;
use App\Support\AuditLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Laravel\Sanctum\PersonalAccessToken;

class TokenController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $tokens = $this->tokens()->orderByDesc('id')->get();

        return TokenResource::collection($tokens)->additional([
            'meta' => ['total' => $tokens->count()],
        ]);
    }

    public function store(StoreTokenRequest $request): JsonResponse
    {
        abort_if((bool) $request->user()->is_bot, 403, 'Bots cannot create tokens.');

        $days = (int) $request->input('expires_in_days', 90);
        $issued = $request->user()->createToken(
            $request->string('name')->toString(),
            ['*'],
            now()->addDays($days),
        );

        AuditLogger::write('token_created', $issued->accessToken, null, [
            'name' => $issued->accessToken->name,
            'expires_at' => $issued->accessToken->expires_at?->toIso8601String(),
        ]);

        return response()->json([
            'data' => [
                'id' => $issued->accessToken->id,
                'name' => $issued->accessToken->name,
                'token' => $issued->plainTextToken,
                'expires_at' => $issued->accessToken->expires_at,
                'abilities' => $issued->accessToken->abilities,
            ],
        ], 201);
    }

    public function destroy(int $id): Response
    {
        $token = $this->tokens()->whereKey($id)->first();

        if ($token === null) {
            abort(404);
        }

        AuditLogger::write('token_revoked', $token, [
            'name' => $token->name,
            'expires_at' => $token->expires_at?->toIso8601String(),
        ], null);

        $token->delete();

        return response()->noContent();
    }

    /**
     * Admins see and revoke every token, not only their own.
     */
    private function tokens(): Builder
    {
        $user = request()->user();
        abort_unless($user !== null && $user->role === 'admin', 403);

        return PersonalAccessToken::query()->with('tokenable');
    }
}
