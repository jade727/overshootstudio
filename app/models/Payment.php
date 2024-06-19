<?php

namespace Application\models;

use Application\abstracts\PaymentAbstract;

class Payment extends PaymentAbstract
{
    protected $CONNECTION;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, PaymentAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}