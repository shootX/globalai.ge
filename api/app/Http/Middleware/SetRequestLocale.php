<?php

namespace App\Http\Middleware;

use App\Support\Locales;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pick the response language from ?locale= (when valid), then Accept-Language, else ka.
 * Strict validation of ?locale= on content endpoints stays in Locales::fromRequest().
 */
class SetRequestLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $query = $request->query('locale');

        $locale = is_string($query) && in_array($query, Locales::ALL, true)
            ? $query
            : ($request->hasHeader('Accept-Language')
                ? $request->getPreferredLanguage(Locales::ALL)
                : null);

        app()->setLocale(in_array($locale, Locales::ALL, true) ? $locale : Locales::PRIMARY);

        $response = $next($request);
        $response->headers->set('Content-Language', app()->getLocale());

        return $response;
    }
}
