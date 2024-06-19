<?php

namespace Application\models;

use Application\abstracts\OtherPaymentAbstract;
use Application\abstracts\PaymentAbstract;

class OtherPayment extends OtherPaymentAbstract
{
    protected $CONNECTION;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, OtherPaymentAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}