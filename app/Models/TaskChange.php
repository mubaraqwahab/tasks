<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskChange extends Model
{
    use HasFactory, HasUuids;

    // protected $fillable = ["type", "args", "created_at"];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
