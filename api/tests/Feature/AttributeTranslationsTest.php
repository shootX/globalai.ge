<?php

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Every rule key of every FormRequest, collected by reflection over app/Http/Requests.
 *
 * @return array<int, string>
 */
function allFormRequestRuleKeys(): array
{
    $keys = [];

    foreach (glob(app_path('Http/Requests/{,*/}*.php'), GLOB_BRACE) as $file) {
        $class = 'App\\'.str_replace(['/', '.php'], ['\\', ''], Str::after($file, app_path().'/'));

        if (! is_subclass_of($class, FormRequest::class)) {
            continue;
        }

        /** @var FormRequest $request */
        $request = $class::createFrom(Request::create('/', 'POST'));
        $request->setRouteResolver(fn () => null);

        foreach (array_keys($request->rules()) as $key) {
            $keys[$key] = true;
        }
    }

    return array_keys($keys);
}

it('finds the FormRequest rule keys', function () {
    expect(allFormRequestRuleKeys())
        ->toContain('slug', 'key', 'role', 'contact_email', 'stats.*.label.ka', 'gallery.*', 'is_published');
});

it('has a translated attribute name for every FormRequest rule key', function (string $locale) {
    app()->setLocale($locale);
    $validator = Validator::make([], []);
    $raw = [];

    foreach (allFormRequestRuleKeys() as $key) {
        $concrete = str_replace('*', '0', $key);
        $shown = $validator->getDisplayableAttribute($concrete);

        // Laravel's fallback is the key itself, or the key with underscores turned into spaces.
        if ($shown === $concrete || $shown === str_replace('_', ' ', Str::snake($concrete))) {
            $raw[] = $key;
        }
    }

    expect($raw)->toBe([]);
})->with(['ka', 'ru']);

it('shows translated names in real responses', function (string $locale, string $field, string $expected) {
    $this->actingAs(User::factory()->create(), 'sanctum');

    $errors = $this->postJson("/api/v1/admin/team?locale={$locale}", [])->assertUnprocessable()->json('errors');
    $settings = $this->putJson("/api/v1/admin/settings?locale={$locale}", ['contact_email' => 'nope'])->json('errors');

    expect(implode(' ', array_merge(...array_values($errors + $settings))))
        ->toContain($expected)
        ->not->toContain(" {$field} ");
})->with([
    'ka role' => ['ka', 'role', 'როლი'],
    'ru role' => ['ru', 'role', 'должность'],
    'ka contact_email' => ['ka', 'contact email', 'საკონტაქტო ელფოსტა'],
    'ru contact_email' => ['ru', 'contact email', 'контактная почта'],
]);
