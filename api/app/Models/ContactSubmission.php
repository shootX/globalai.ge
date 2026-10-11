<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Database\Factories\ContactSubmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'phone', 'subject', 'message', 'locale', 'ip', 'user_agent', 'status'])]
class ContactSubmission extends Model
{
    /** @use HasFactory<ContactSubmissionFactory> */
    use Auditable, HasFactory;

    public const STATUS_NEW = 'new';

    public const STATUS_READ = 'read';

    public const STATUS_ARCHIVED = 'archived';

    public const STATUSES = [
        self::STATUS_NEW,
        self::STATUS_READ,
        self::STATUS_ARCHIVED,
    ];
}
