<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email')->toString())->first();

        if ($user === null || ! Hash::check($request->string('password')->toString(), $user->password)) {
            return response()->json([
                'message' => __('auth.failed'),
            ], 422);
        }

        $issued = $user->createToken('admin', ['*'], now()->addDays(90));

        AuditLogger::write('login', $user, null, [
            'name' => $user->name,
            'email' => $user->email,
        ], $user->id);

        return response()->json([
            'data' => [
                'token' => $issued->plainTextToken,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            AuditLogger::write('token_revoked', $token, [
                'name' => $token->name,
                'expires_at' => $token->expires_at?->toIso8601String(),
            ], null, $request->user()->id);
            $token->delete();
        } else {
            $request->user()?->tokens()->delete();
        }

        return response()->json(['data' => ['ok' => true]]);
    }
}
