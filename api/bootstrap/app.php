<?php

use App\Http\Middleware\NoStoreCacheHeaders;
use App\Http\Middleware\SetPublicCacheHeaders;
use App\Http\Middleware\SetRequestLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'public.cache' => SetPublicCacheHeaders::class,
            'no.store' => NoStoreCacheHeaders::class,
        ]);

        $middleware->api(prepend: [SetRequestLocale::class]);

        // TrimStrings strips " \n\r\t\v\0" from both ends, which turned "uploads/x.png%00" into a
        // valid-looking path. Upload deletion must validate the raw value, so skip trimming there.
        $middleware->trimStrings(except: [
            fn (Request $request) => $request->is('api/v1/admin/uploads'),
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if ($request->is('api/*')) {
                $response->headers->set('Cache-Control', 'no-store');
            }

            return $response;
        });
    })->create();
