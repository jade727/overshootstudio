<?php

namespace Application\abstracts;

abstract class OtherPaymentAbstract extends ModelDefaultFunctions
{
    public $payment_id;

    public $user_id;

    public $request_id;

    public $method;

    public $is_walkin;

    public $cash;

    public $cash_change;

    public $balance;

    public $number;

    public $reference;

    public $image;
    public $sender_number;
    public $sent_amount;

    public $note;

    public $status;

    public $db_status;

    public $date_created;
}