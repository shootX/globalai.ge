<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSubmissionStatusRequest;
use App\Http\Resources\Admin\ContactSubmissionResource;
use App\Models\ContactSubmission;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class SubmissionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ContactSubmission::class);

        $submissions = ContactSubmission::query()->latest('id')->get();

        return ContactSubmissionResource::collection($submissions)->additional([
            'meta' => ['total' => $submissions->count()],
        ]);
    }

    public function show(ContactSubmission $submission): ContactSubmissionResource
    {
        $this->authorize('view', $submission);

        return new ContactSubmissionResource($submission);
    }

    public function update(UpdateSubmissionStatusRequest $request, ContactSubmission $submission): ContactSubmissionResource
    {
        $this->authorize('update', $submission);

        $submission->update([
            'status' => $request->validated('status'),
        ]);

        return new ContactSubmissionResource($submission);
    }

    public function destroy(ContactSubmission $submission): Response
    {
        $this->authorize('delete', $submission);

        $submission->delete();

        return response()->noContent();
    }
}
