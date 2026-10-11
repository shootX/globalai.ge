<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
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

        RateLimiter::for('contact', function (Request $request) {
            return Limit::perMinute(5)->by('contact:'.$request->ip());
        });

        RateLimiter::for('admin-login', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return Limit::perMinute(10)->by('login:'.$request->ip().'|'.$email);
        });
    }
}
