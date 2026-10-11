<?php

use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\AuthController;
use App\Http\Controllers\Api\V1\Admin\PageController as AdminPageController;
use App\Http\Controllers\Api\V1\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Api\V1\Admin\SeoPageController;
use App\Http\Controllers\Api\V1\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\V1\Admin\SubmissionController;
use App\Http\Controllers\Api\V1\Admin\TeamMemberController;
use App\Http\Controllers\Api\V1\Admin\TokenController;
use App\Http\Controllers\Api\V1\Admin\UploadController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\PageController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\TeamController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::middleware('public.cache')->group(function () {
        Route::get('services', [ServiceController::class, 'index']);
        Route::get('services/{slug}', [ServiceController::class, 'show']);
        Route::get('projects', [ProjectController::class, 'index']);
        Route::get('projects/{slug}', [ProjectController::class, 'show']);
        Route::get('team', [TeamController::class, 'index']);
        Route::get('pages/{key}', [PageController::class, 'show'])
            ->where('key', 'home|about|services|projects|contact');
        Route::get('settings', [SettingController::class, 'index']);
    });

    Route::post('contact', [ContactController::class, 'store'])
        ->middleware(['no.store', 'throttle:contact']);

    Route::prefix('admin')->middleware('no.store')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:admin-login');

        Route::middleware(['auth:sanctum', 'token.active', 'throttle:admin-api', 'can:admin'])->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);

            Route::get('tokens', [TokenController::class, 'index']);
            Route::post('tokens', [TokenController::class, 'store']);
            Route::delete('tokens/{id}', [TokenController::class, 'destroy'])->whereNumber('id');

            Route::get('audit-logs', [AuditLogController::class, 'index']);
            Route::match(['post', 'put', 'patch', 'delete'], 'audit-logs', [AuditLogController::class, 'rejectWrite']);
            Route::match(['put', 'patch', 'delete'], 'audit-logs/{id}', [AuditLogController::class, 'rejectWrite'])->whereNumber('id');

            Route::get('seo/pages/{key}', [SeoPageController::class, 'show'])
                ->where('key', 'home|about|services|projects|contact');
            Route::put('seo/pages/{key}', [SeoPageController::class, 'update'])
                ->where('key', 'home|about|services|projects|contact');

            Route::apiResource('services', AdminServiceController::class);
            Route::apiResource('projects', AdminProjectController::class);
            Route::apiResource('team', TeamMemberController::class)->parameters([
                'team' => 'teamMember',
            ]);

            Route::get('pages', [AdminPageController::class, 'index']);
            Route::post('pages', [AdminPageController::class, 'store']);
            Route::get('pages/{page:key}', [AdminPageController::class, 'show']);
            Route::put('pages/{page:key}', [AdminPageController::class, 'update']);
            Route::delete('pages/{page:key}', [AdminPageController::class, 'destroy']);

            Route::get('submissions', [SubmissionController::class, 'index']);
            Route::get('submissions/{submission}', [SubmissionController::class, 'show']);
            Route::patch('submissions/{submission}', [SubmissionController::class, 'update']);
            Route::delete('submissions/{submission}', [SubmissionController::class, 'destroy']);

            Route::get('settings', [AdminSettingController::class, 'index']);
            Route::put('settings', [AdminSettingController::class, 'update']);

            Route::post('uploads', [UploadController::class, 'store']);
            Route::delete('uploads', [UploadController::class, 'destroy']);
        });
    });
});
