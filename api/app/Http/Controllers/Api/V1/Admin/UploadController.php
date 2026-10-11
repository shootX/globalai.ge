<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DeleteUploadRequest;
use App\Http\Requests\Admin\UploadImageRequest;
use App\Models\Setting;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use League\Flysystem\CorruptedPathDetected;
use League\Flysystem\UnableToDeleteFile;

class UploadController extends Controller
{
    public function store(UploadImageRequest $request): JsonResponse
    {
        $this->authorize('upload', Setting::class);

        $path = $request->file('file')->store('uploads', 'public');

        AuditLogger::write('uploaded', null, null, ['path' => $path], modelType: 'upload');

        return response()->json([
            'data' => [
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
            ],
        ], 201);
    }

    public function destroy(DeleteUploadRequest $request): Response
    {
        $this->authorize('deleteUpload', Setting::class);

        $path = $request->uploadPath();
        $disk = Storage::disk('public');

        try {
            abort_unless($disk->exists($path), 404);

            AuditLogger::write('deleted', null, ['path' => $path], null, modelType: 'upload');

            if (! $disk->delete($path)) {
                throw UnableToDeleteFile::atLocation($path);
            }
        } catch (CorruptedPathDetected|UnableToDeleteFile) {
            // Safety net: the request should already have rejected such paths.
            throw ValidationException::withMessages([
                'path' => [__('validation.in', ['attribute' => __('validation.attributes.path')])],
            ]);
        }

        return response()->noContent();
    }
}
