<?php

class CapubbsNotificationService {
    private $messageRepository;
    private $userRepository;

    public function __construct($messageRepository, $userRepository) {
        $this->messageRepository = $messageRepository;
        $this->userRepository = $userRepository;
    }

    public function notifyMentionsAndQuotes($text, $bid, $tid, $pid, $username, $threadTitle) {
        $matches = array();
        preg_match_all("#\\[at\\](.+?)\\[/at\\]#", $text, $matches, PREG_SET_ORDER);
        foreach ($matches as $one) {
            $target = $one[1];
            if ($this->userRepository->existsByUsername($target)) {
                $this->messageRepository->insert('system', $target, 'at', $bid, $tid, $pid, $username, $threadTitle);
            }
        }

        preg_match_all("#\\[quote=(.+?)\\](.+?)\\[/quote\\]#", $text, $matches, PREG_SET_ORDER);
        foreach ($matches as $one) {
            $target = $one[1];
            if ($this->userRepository->existsByUsername($target)) {
                $this->messageRepository->insert('system', $target, 'quote', $bid, $tid, $pid, $username, $threadTitle);
            }
        }
    }

    public function notifyThreadReply($threadAuthor, $replyAuthor, $bid, $tid, $pid, $threadTitle) {
        if ($threadAuthor === '' || $threadAuthor == $replyAuthor) {
            return;
        }

        $this->messageRepository->insert('system', $threadAuthor, 'reply', $bid, $tid, $pid, $replyAuthor, $threadTitle);
    }

    public function notifyNestedReply($text, $bid, $tid, $pid, $username, $threadTitle, $threadAuthor, $postAuthor) {
        if ($postAuthor != '' && $postAuthor != $username) {
            $this->messageRepository->insert('system', $postAuthor, 'replylzl', $bid, $tid, $pid, $username, $threadTitle);
        }

        if ($threadAuthor != '' && $threadAuthor != $username && $threadAuthor != $postAuthor) {
            $this->messageRepository->insert('system', $threadAuthor, 'reply', $bid, $tid, $pid, $username, $threadTitle);
        }

        $matches = array();
        if (preg_match('/^回复 @(.*)(:|：).*/s', $text, $matches)) {
            $replied = $matches[1];
            if ($replied != $postAuthor && $replied != $threadAuthor) {
                $this->messageRepository->insert('system', $replied, 'replylzlreply', $bid, $tid, $pid, $username, $threadTitle);
            }
        }
    }
}
