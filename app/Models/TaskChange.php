<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskChange extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ["id", "type", "created_at"];
}
