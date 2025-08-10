<?php

namespace App\Notifications;

use App\Models\Answer;
use App\Models\Question;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewAnswerNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Answer $answer,
        public Question $question,
        public User $answerer
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'new_answer',
            'message' => "{$this->answerer->name} answered your question: {$this->question->title}",
            'answer_id' => $this->answer->id,
            'question_id' => $this->question->id,
            'question_title' => $this->question->title,
            'question_slug' => $this->question->slug,
            'answerer_name' => $this->answerer->name,
            'answerer_avatar' => $this->answerer->avatar_url,
            'created_at' => now()->toISOString(),
        ];
    }
}
