<?php

namespace App\Models\Concerns;

use App\Support\AuditLogger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    protected static function bootAuditable(): void
    {
        static::created(function (Model $model): void {
            if (! Auth::check()) {
                return;
            }

            AuditLogger::write('created', $model, null, self::auditSnapshot($model));
        });

        static::updated(function (Model $model): void {
            if (! Auth::check()) {
                return;
            }

            $old = [];
            $new = [];

            foreach ($model->getChanges() as $key => $value) {
                if (in_array($key, ['created_at', 'updated_at'], true)) {
                    continue;
                }

                $old[$key] = $model->getOriginal($key);
                $new[$key] = $value;
            }

            AuditLogger::write('updated', $model, $old, $new);
        });

        static::deleted(function (Model $model): void {
            if (! Auth::check()) {
                return;
            }

            AuditLogger::write('deleted', $model, self::auditSnapshot($model), null);
        });
    }

    /**
     * @return array<string, mixed>
     */
    private static function auditSnapshot(Model $model): array
    {
        $values = $model->getAttributes();
        unset($values['created_at'], $values['updated_at']);

        return $values;
    }
}
