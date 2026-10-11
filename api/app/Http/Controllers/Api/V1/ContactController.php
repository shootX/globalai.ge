<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Mail\ContactSubmissionReceived;
use App\Models\ContactSubmission;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ContactController extends Controller
{
    public function store(ContactRequest $request): JsonResponse
    {
        if (filled($request->input('company_website'))) {
            return response()->json(['data' => ['accepted' => true]], 201);
        }

        $submission = ContactSubmission::query()->create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'phone' => $request->input('phone'),
            'subject' => $request->input('subject'),
            'message' => $request->string('message')->toString(),
            'locale' => $request->string('locale')->toString(),
            'ip' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 1000, ''),
            'status' => ContactSubmission::STATUS_NEW,
        ]);

        $this->notify($submission);

        return response()->json(['data' => ['accepted' => true]], 201);
    }

    private function notify(ContactSubmission $submission): void
    {
        $to = Setting::getValue('contact_email');

        if (! is_string($to) || $to === '') {
            $to = config('mail.admin_address');
        }

        if (! is_string($to) || $to === '') {
            return;
        }

        Mail::to($to)->queue(new ContactSubmissionReceived($submission));
    }
}
