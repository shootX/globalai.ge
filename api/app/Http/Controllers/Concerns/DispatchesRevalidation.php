<?php

namespace App\Http\Controllers\Concerns;

use App\Jobs\RevalidateNextJob;

trait DispatchesRevalidation
{
    protected function revalidate(string $tag): void
    {
        RevalidateNextJob::dispatch($tag)->afterCommit();
    }
}
