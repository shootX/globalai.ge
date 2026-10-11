<x-mail::message>
# New contact message

**Name:** {{ $submission->name }}

**Email:** {{ $submission->email }}

**Phone:** {{ $submission->phone ?: '—' }}

**Subject:** {{ $submission->subject ?: '—' }}

**Locale:** {{ $submission->locale }}

{{ $submission->message }}
</x-mail::message>
