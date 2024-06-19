<?php

namespace Application\models;

use Application\abstracts\WalkInAbstract;
use Carbon\Carbon;

class WalkIn extends WalkInAbstract
{
    protected $CONNECTION;

    public $user;
    public $package;

    public $schedule_original;

    public $other_payments;

    public $is_paid;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, WalkInAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->schedule_original = $this->schedule;

        $schedule = Carbon::create($this->schedule);

        $this->user = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->user_id, true);
        $this->package = $APPLICATION->FUNCTIONS->PACKAGE_CONTROL->get($this->package_id, true);
        $this->other_payments = $APPLICATION->FUNCTIONS->OTHER_PAYMENT_CONTROL->filterRecords(['request_id' => $this->walkin_id, 'is_walkin' => 1], true);
        $otherPaymentTotal = 0;

        if (count($this->other_payments) > 0) {
            $this->other_payments = array_map(function ($payment) {
                return $payment->method == 1 ? $payment->cash : $payment->sent_amount;
            }, $this->other_payments);

            $otherPaymentTotal = array_reduce($this->other_payments, function($a, $b) {
                return $a + $b;
            });
        }

        $this->balance = $this->balance - $otherPaymentTotal;
        $this->is_paid = $this->balance <= 0;
        $this->schedule = $schedule->calendar();

    }
}