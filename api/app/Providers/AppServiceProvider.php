<?php

namespace App\Providers;

use App\Models\Setting;
use App\Models\User;
use App\Observers\SettingObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Spatie\Translatable\Facades\Translatable;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Translatable::fallback(fallbackLocale: 'ka');

        Setting::observe(SettingObserver::class);

        Gate::define('admin', fn (User $user): bool => $user->role === User::ROLE_ADMIN);

        RateLimiter::for('contact', function (Request $request) {
            return Limit::perMinute(5)->by('contact:'.$request->ip());
        });

        RateLimiter::for('admin-login', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return Limit::perMinute(10)->by('login:'.$request->ip().'|'.$email);
        });

        RateLimiter::for('admin-api', function (Request $request) {
            $token = $request->user()?->currentAccessToken();
            $key = $token instanceof PersonalAccessToken
                ? 'token:'.$token->getKey()
                : 'user:'.($request->user()?->getAuthIdentifier() ?? $request->ip());

            return Limit::perMinute(120)->by('admin-api:'.$key);
        });
    }
}
