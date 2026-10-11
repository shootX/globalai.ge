<?php

namespace App\Http\Resources\Admin;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var AuditLog $log */
        $log = $this->resource;
        $type = $log->model_type;
        $short = is_string($type) && str_contains($type, '\\') ? class_basename($type) : $type;

        return [
            'id' => $log->id,
            'user_id' => $log->user_id,
            'user' => $log->user === null ? null : [
                'id' => $log->user->id,
                'name' => $log->user->name,
            ],
            'action' => $log->action,
            'model_type' => $log->model_type,
            'model' => $short,
            'model_id' => $log->model_id,
            'old_values' => $log->old_values,
            'new_values' => $log->new_values,
            'ip' => $log->ip,
            'user_agent' => $log->user_agent,
            'created_at' => $log->created_at,
        ];
    }
}
