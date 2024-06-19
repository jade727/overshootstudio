<?php

namespace Application\controllers\app;

class Response
{
    public $code;

    public $body;

    public $message;

    public $headers;

    /**
     * @param $code
     * @param array $body
     * @param string $message
     * @param array $headers
     */
    public function __construct($code, string $message = "", array $body = [], array $headers = [])
    {
        $this->code = $code;
        $this->body = $body;
        $this->message = $message;
        $this->headers = $headers;
    }

    public function getMessage(): string
    {
        return $this->message;
    }
}