<?php

namespace Application\models;

use Application\abstracts\RequestAbstract;
use Application\abstracts\UserAbstract;
use DateTime;
use Carbon\Carbon;
class UserRequest extends RequestAbstract
{
    protected $CONNECTION;

    public $user;
    public $package;

    public $schedule_original;

    public $payment;

    public $down_payment;


    public $other_payments;

    public $balance;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, RequestAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->schedule_original = $this->schedule;

        $schedule = Carbon::create($this->schedule);

//        $dt = DateTime::createFromFormat('!d/m/Y', $this->schedule);


        $this->user = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->user_id, true);
        $this->package = $APPLICATION->FUNCTIONS->PACKAGE_CONTROL->get($this->package_id, true);
        $this->payment = $APPLICATION->FUNCTIONS->PAYMENT_CONTROL->get($this->payment_id, true);

        $this->other_payments = $APPLICATION->FUNCTIONS->OTHER_PAYMENT_CONTROL->filterRecords(['request_id' => $this->request_id, 'is_walkin' => '0'], true);
        $otherPaymentTotal = 0;

        if (count($this->other_payments) > 0) {
            $otherPaymentTotal = array_reduce($this->other_payments, function($a, $b) {
                $aPayment = $a->method == 1 ? $a->cash : $a->sent_amount;
                $bPayment = $b->method == 2 ? $b->cash : $b->sent_amount;

                return $aPayment + $bPayment;
            });
        }

        $this->balance = $this->payment->topay - ($this->payment->sent_amount + $otherPaymentTotal);
        $this->down_payment = $this->payment->sent_amount;
        $this->schedule = $schedule->calendar();
    }

    public function getResult() {
        global $APPLICATION;

        return $APPLICATION->FUNCTIONS->RESULT_IMAGE_SET_CONTROL->getQuery(['request_id' => $this->request_id], true);
    }
}